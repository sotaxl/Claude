"""
Keyboard Mode Guard
Identifies and blocks keys that accidentally deactivate your laptop keyboard.
Requires Python 3.x on Windows. No external packages needed.
Run via launch.bat (recommended) or: python keyboard_guard.py
"""

import tkinter as tk
from tkinter import ttk, scrolledtext
import ctypes
import ctypes.wintypes as wintypes
import threading
import time
import sys
import winreg
from datetime import datetime

# --------------------------------------------------------------------------- #
# Windows type helpers
# --------------------------------------------------------------------------- #

if ctypes.sizeof(ctypes.c_void_p) == 8:
    LRESULT = ctypes.c_int64
else:
    LRESULT = ctypes.c_long

user32   = ctypes.windll.user32
kernel32 = ctypes.windll.kernel32


class KBDLLHOOKSTRUCT(ctypes.Structure):
    _fields_ = [
        ("vkCode",      wintypes.DWORD),
        ("scanCode",    wintypes.DWORD),
        ("flags",       wintypes.DWORD),
        ("time",        wintypes.DWORD),
        ("dwExtraInfo", ctypes.c_size_t),   # ULONG_PTR (pointer-sized)
    ]


HOOKPROC_TYPE = ctypes.WINFUNCTYPE(
    LRESULT, ctypes.c_int, wintypes.WPARAM, wintypes.LPARAM
)

WH_KEYBOARD_LL = 13
WM_KEYDOWN     = 0x0100
WM_KEYUP       = 0x0101
WM_SYSKEYDOWN  = 0x0104
WM_SYSKEYUP    = 0x0105
WM_QUIT        = 0x0012

VK_NUMLOCK = 0x90
VK_SCROLL  = 0x91
VK_CAPITAL = 0x14
VK_SHIFT   = 0x10
VK_LSHIFT  = 0xA0
VK_RSHIFT  = 0xA1

VK_NAMES = {
    VK_NUMLOCK: "Num Lock",
    VK_SCROLL:  "Scroll Lock",
    VK_CAPITAL: "Caps Lock",
    VK_SHIFT:   "Shift",
    VK_LSHIFT:  "Left Shift",
    VK_RSHIFT:  "Right Shift",
    0xA2: "Left Ctrl",  0xA3: "Right Ctrl", 0x11: "Ctrl",
    0xA4: "Left Alt",   0xA5: "Right Alt",  0x12: "Alt",
    0x5B: "Left Win",   0x5C: "Right Win",
}

# Accessibility registry paths
ACC_PATHS = {
    "sticky": r"Control Panel\Accessibility\StickyKeys",
    "filter": r"Control Panel\Accessibility\Keyboard Response",
    "toggle": r"Control Panel\Accessibility\ToggleKeys",
}

# Safe "feature present but off, shortcut disabled" flag values
ACC_SAFE_FLAGS = {
    "sticky": "506",
    "filter": "126",
    "toggle": "58",
}


# --------------------------------------------------------------------------- #
# Keyboard monitor (runs in its own thread)
# --------------------------------------------------------------------------- #

class KeyboardMonitor:
    def __init__(self, log_fn, get_block_numlock, get_block_scroll, get_block_caps):
        self.log         = log_fn
        self.blk_num     = get_block_numlock
        self.blk_scroll  = get_block_scroll
        self.blk_caps    = get_block_caps
        self.hook        = None
        self._hook_func  = None   # must stay alive to prevent GC crash
        self.thread_id   = None

        self._shift_times     = []
        self._shift_hold_at   = None

    def _proc(self, nCode, wParam, lParam):
        if nCode >= 0:
            kb = ctypes.cast(lParam, ctypes.POINTER(KBDLLHOOKSTRUCT)).contents
            vk       = kb.vkCode
            injected = bool(kb.flags & 0x10)
            is_down  = wParam in (WM_KEYDOWN, WM_SYSKEYDOWN)
            is_up    = wParam in (WM_KEYUP,   WM_SYSKEYUP)

            # Track Shift for Sticky/Filter Keys warning
            if not injected and vk in (VK_SHIFT, VK_LSHIFT, VK_RSHIFT):
                if is_down:
                    now = time.monotonic()
                    self._shift_hold_at = now
                    self._shift_times = [t for t in self._shift_times if now - t < 4.0]
                    self._shift_times.append(now)
                    if len(self._shift_times) >= 5:
                        self.log("WARNING: Shift pressed 5 times rapidly — "
                                 "Sticky Keys shortcut may have triggered!")
                        self._shift_times = []
                elif is_up:
                    if self._shift_hold_at is not None:
                        held = time.monotonic() - self._shift_hold_at
                        if held >= 7.0:
                            self.log(f"WARNING: Shift held {held:.1f}s — "
                                     "Filter Keys shortcut may have activated!")
                    self._shift_hold_at = None

            # Mode-key handling
            if is_down:
                name = VK_NAMES.get(vk)
                if vk == VK_NUMLOCK:
                    if self.blk_num():
                        self.log(f"BLOCKED:   Num Lock  (VK 0x{vk:02X})")
                        return 1
                    self.log(f"DETECTED:  Num Lock  (VK 0x{vk:02X}) — not blocked")
                elif vk == VK_SCROLL:
                    if self.blk_scroll():
                        self.log(f"BLOCKED:   Scroll Lock  (VK 0x{vk:02X})")
                        return 1
                    self.log(f"DETECTED:  Scroll Lock  (VK 0x{vk:02X}) — not blocked")
                elif vk == VK_CAPITAL:
                    if self.blk_caps():
                        self.log(f"BLOCKED:   Caps Lock  (VK 0x{vk:02X})")
                        return 1
                    self.log(f"DETECTED:  Caps Lock  (VK 0x{vk:02X}) — not blocked")

        return user32.CallNextHookEx(self.hook, nCode, wParam, lParam)

    def run(self):
        self.thread_id  = kernel32.GetCurrentThreadId()
        self._hook_func = HOOKPROC_TYPE(self._proc)

        self.hook = user32.SetWindowsHookExW(
            WH_KEYBOARD_LL,
            self._hook_func,
            kernel32.GetModuleHandleW(None),
            0,
        )
        if not self.hook:
            self.log(f"ERROR: Could not install keyboard hook "
                     f"(Win error {kernel32.GetLastError()}). "
                     "Try running as Administrator.")
            return

        self.log("Hook installed — monitoring all keystrokes.")

        msg = wintypes.MSG()
        while True:
            ret = user32.GetMessageW(ctypes.byref(msg), None, 0, 0)
            if ret <= 0:
                break
            user32.TranslateMessage(ctypes.byref(msg))
            user32.DispatchMessageW(ctypes.byref(msg))

        user32.UnhookWindowsHookEx(self.hook)
        self.hook = None
        self.log("Hook removed — monitoring stopped.")

    def stop(self):
        if self.thread_id:
            user32.PostThreadMessageW(self.thread_id, WM_QUIT, 0, 0)


# --------------------------------------------------------------------------- #
# GUI
# --------------------------------------------------------------------------- #

class App:
    # ------------------------------------------------------------------
    def __init__(self, root: tk.Tk):
        self.root    = root
        self.monitor = None
        self._mon_thread = None

        self.blk_num    = tk.BooleanVar(value=True)
        self.blk_scroll = tk.BooleanVar(value=True)
        self.blk_caps   = tk.BooleanVar(value=False)

        root.title("Keyboard Mode Guard")
        root.geometry("640x600")
        root.resizable(True, True)
        root.configure(bg="#0f0f1a")

        self._build_ui()
        self._refresh_accessibility()
        self._log("Ready.  Click  ▶ Start Monitoring  to begin.")
        self._warn_if_not_admin()

    # ------------------------------------------------------------------
    def _build_ui(self):
        BG   = "#0f0f1a"
        HDR  = "#1a1a2e"
        ACC  = "#e94560"
        FG   = "#e0e0e0"
        MUTED= "#888899"
        GREEN= "#2ecc71"

        # Header
        hdr = tk.Frame(self.root, bg=HDR, pady=10)
        hdr.pack(fill=tk.X)
        tk.Label(hdr, text="Keyboard Mode Guard",
                 font=("Segoe UI", 16, "bold"), fg=ACC, bg=HDR).pack()
        tk.Label(hdr,
                 text="Detects and blocks keys that accidentally deactivate your keyboard",
                 font=("Segoe UI", 9), fg=MUTED, bg=HDR).pack()

        # Status bar
        self._status = tk.StringVar(value="Stopped")
        sf = tk.Frame(self.root, bg="#16213e", pady=5)
        sf.pack(fill=tk.X)
        self._status_lbl = tk.Label(sf, textvariable=self._status,
                                    font=("Segoe UI", 10, "bold"),
                                    bg="#16213e", fg=ACC)
        self._status_lbl.pack()

        # ---------- Block keys section ----------
        bfr = tk.LabelFrame(self.root, text=" Block Mode Keys ",
                             fg=FG, bg=BG, font=("Segoe UI", 9, "bold"), padx=10, pady=6)
        bfr.pack(fill=tk.X, padx=12, pady=(8, 4))

        for var, label, hint in [
            (self.blk_num,    "Block Num Lock",    "Stops the numpad toggling between numbers and arrow keys"),
            (self.blk_scroll, "Block Scroll Lock", "Stops Scroll Lock (rarely useful, often disruptive)"),
            (self.blk_caps,   "Block Caps Lock",   "Stops Caps Lock from activating"),
        ]:
            row = tk.Frame(bfr, bg=BG)
            row.pack(fill=tk.X, pady=1)
            ttk.Checkbutton(row, text=label, variable=var).pack(side=tk.LEFT)
            tk.Label(row, text=f"  — {hint}", font=("Segoe UI", 8),
                     fg=MUTED, bg=BG).pack(side=tk.LEFT)

        # ---------- Windows Accessibility section ----------
        afr = tk.LabelFrame(
            self.root,
            text=" Windows Accessibility Shortcuts  (accidental triggers can deactivate keyboard behavior) ",
            fg=FG, bg=BG, font=("Segoe UI", 9, "bold"), padx=10, pady=8,
        )
        afr.pack(fill=tk.X, padx=12, pady=4)

        self._acc_vars = {}
        descs = {
            "sticky": "Sticky Keys  — Shift pressed 5×  (modifier keys stay latched)",
            "filter": "Filter Keys  — Shift held 8 s    (ignores rapid/repeated keystrokes)",
            "toggle": "Toggle Keys  — Num Lock held 5 s (plays beep on lock-key press)",
        }
        for key, desc in descs.items():
            sv = tk.StringVar(value=f"{desc}: checking…")
            self._acc_vars[key] = sv
            row = tk.Frame(afr, bg=BG)
            row.pack(fill=tk.X, pady=3)
            tk.Label(row, textvariable=sv, font=("Segoe UI", 9),
                     fg=FG, bg=BG, anchor=tk.W, width=62).pack(side=tk.LEFT)
            tk.Button(
                row, text="Disable Shortcut",
                font=("Segoe UI", 8), bg="#c0392b", fg="white",
                bd=0, padx=6, pady=2, cursor="hand2",
                command=lambda k=key: self._disable_acc(k),
            ).pack(side=tk.RIGHT)

        # ---------- Buttons ----------
        btn_row = tk.Frame(self.root, bg=BG)
        btn_row.pack(fill=tk.X, padx=12, pady=6)

        self._start_btn = tk.Button(
            btn_row, text="▶  Start Monitoring",
            font=("Segoe UI", 11, "bold"), bg=GREEN, fg="white",
            bd=0, padx=20, pady=8, cursor="hand2",
            command=self._start,
        )
        self._start_btn.pack(side=tk.LEFT, padx=(0, 6))

        self._stop_btn = tk.Button(
            btn_row, text="■  Stop",
            font=("Segoe UI", 11), bg="#e74c3c", fg="white",
            bd=0, padx=20, pady=8, cursor="hand2",
            state=tk.DISABLED, command=self._stop,
        )
        self._stop_btn.pack(side=tk.LEFT, padx=6)

        tk.Button(
            btn_row, text="Clear Log",
            font=("Segoe UI", 10), bd=1, padx=14, pady=8, cursor="hand2",
            command=self._clear_log,
        ).pack(side=tk.RIGHT)

        # ---------- Log ----------
        lfr = tk.LabelFrame(self.root, text=" Event Log ",
                            fg=FG, bg=BG, font=("Segoe UI", 9, "bold"), padx=6, pady=6)
        lfr.pack(fill=tk.BOTH, expand=True, padx=12, pady=(4, 10))

        self._log_box = scrolledtext.ScrolledText(
            lfr, font=("Consolas", 9),
            state=tk.DISABLED, bg="#0a0a14", fg="#00ff88",
            insertbackground="white",
        )
        self._log_box.pack(fill=tk.BOTH, expand=True)

    # ------------------------------------------------------------------
    def _log(self, msg: str):
        ts = datetime.now().strftime("%H:%M:%S")
        self.root.after(0, self._append, f"[{ts}]  {msg}")

    def _append(self, text: str):
        self._log_box.config(state=tk.NORMAL)
        self._log_box.insert(tk.END, text + "\n")
        self._log_box.see(tk.END)
        self._log_box.config(state=tk.DISABLED)

    def _clear_log(self):
        self._log_box.config(state=tk.NORMAL)
        self._log_box.delete("1.0", tk.END)
        self._log_box.config(state=tk.DISABLED)

    # ------------------------------------------------------------------
    def _warn_if_not_admin(self):
        try:
            if not ctypes.windll.shell32.IsUserAnAdmin():
                self._log("NOTE: Not running as Administrator.")
                self._log("      For reliable key-blocking use launch.bat")
                self._log("      (right-click → Run as administrator).")
        except Exception:
            pass

    # ------------------------------------------------------------------
    def _refresh_accessibility(self):
        labels = {
            "sticky": "Sticky Keys  (Shift ×5)",
            "filter": "Filter Keys  (Hold Shift 8 s)",
            "toggle": "Toggle Keys  (Hold Num Lock 5 s)",
        }
        for key, path in ACC_PATHS.items():
            sv = self._acc_vars[key]
            try:
                rk = winreg.OpenKey(winreg.HKEY_CURRENT_USER, path)
                flags_str, _ = winreg.QueryValueEx(rk, "Flags")
                winreg.CloseKey(rk)
                flags    = int(flags_str)
                active   = bool(flags & 0x1)
                shortcut = bool(flags & 0x2)
                if active:
                    sv.set(f"{labels[key]}:  ACTIVE ⚠")
                elif shortcut:
                    sv.set(f"{labels[key]}:  shortcut ENABLED ⚠  (can trigger accidentally)")
                else:
                    sv.set(f"{labels[key]}:  OK — shortcut disabled")
            except Exception as exc:
                sv.set(f"{labels[key]}:  could not read registry ({exc})")

    def _disable_acc(self, key: str):
        path = ACC_PATHS[key]
        safe = ACC_SAFE_FLAGS[key]
        try:
            rk = winreg.OpenKey(winreg.HKEY_CURRENT_USER, path, 0, winreg.KEY_SET_VALUE)
            winreg.SetValueEx(rk, "Flags", 0, winreg.REG_SZ, safe)
            winreg.CloseKey(rk)
            self._log(f"Disabled shortcut for: {key.title()} Keys")
            self._refresh_accessibility()
        except PermissionError:
            self._log(f"Permission denied writing registry for {key.title()} Keys. "
                      "Run as Administrator.")
        except Exception as exc:
            self._log(f"Error disabling {key.title()} Keys shortcut: {exc}")

    # ------------------------------------------------------------------
    def _start(self):
        mon = KeyboardMonitor(
            self._log,
            self.blk_num.get,
            self.blk_scroll.get,
            self.blk_caps.get,
        )
        self.monitor = mon
        self._mon_thread = threading.Thread(target=mon.run, daemon=True)
        self._mon_thread.start()

        self._start_btn.config(state=tk.DISABLED)
        self._stop_btn.config(state=tk.NORMAL)
        self._status.set("Monitoring Active")
        self._status_lbl.config(fg="#2ecc71")

    def _stop(self):
        if self.monitor:
            self.monitor.stop()
            self.monitor = None

        self._start_btn.config(state=tk.NORMAL)
        self._stop_btn.config(state=tk.DISABLED)
        self._status.set("Stopped")
        self._status_lbl.config(fg="#e94560")

    def on_close(self):
        self._stop()
        self.root.destroy()


# --------------------------------------------------------------------------- #
# Entry point
# --------------------------------------------------------------------------- #

def main():
    root = tk.Tk()
    app  = App(root)
    root.protocol("WM_DELETE_WINDOW", app.on_close)
    root.mainloop()


if __name__ == "__main__":
    main()
