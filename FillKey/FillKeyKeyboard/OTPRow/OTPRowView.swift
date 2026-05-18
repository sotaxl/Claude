import UIKit

// UIKit-only: SwiftUI has known bugs in keyboard extensions on iOS 17-18
final class OTPRowView: UIView {

    // MARK: – Subviews

    private let stackView: UIStackView = {
        let sv = UIStackView()
        sv.axis = .horizontal
        sv.spacing = 8
        sv.alignment = .center
        sv.translatesAutoresizingMaskIntoConstraints = false
        return sv
    }()

    private let iconLabel: UILabel = {
        let l = UILabel()
        l.text = "🔑"
        l.font = .systemFont(ofSize: 16)
        return l
    }()

    private let smsChip = OTPChipView(label: "SMS")
    private let totpChip = TOTPChipView()

    let hubButton: UIButton = {
        var config = UIButton.Configuration.filled()
        config.title = "Hub"
        config.image = UIImage(systemName: "arrow.up")
        config.imagePadding = 4
        config.baseBackgroundColor = .systemYellow
        config.baseForegroundColor = .black
        config.cornerStyle = .capsule
        config.buttonSize = .small
        let b = UIButton(configuration: config)
        b.setContentHuggingPriority(.required, for: .horizontal)
        return b
    }()

    // MARK: – State

    var smsCode: String? {
        didSet { smsChip.code = smsCode; updateVisibility() }
    }

    var totpCode: String? {
        didSet { totpChip.code = totpCode; updateVisibility() }
    }

    var totpSecondsRemaining: Int = 30 {
        didSet { totpChip.secondsRemaining = totpSecondsRemaining }
    }

    var onSMSTap: ((String) -> Void)?
    var onTOTPTap: ((String) -> Void)?
    var onHubTap: (() -> Void)?

    // MARK: – Init

    override init(frame: CGRect) {
        super.init(frame: frame)
        setup()
    }

    required init?(coder: NSCoder) { fatalError() }

    private func setup() {
        backgroundColor = .systemBackground

        addSubview(stackView)
        NSLayoutConstraint.activate([
            stackView.leadingAnchor.constraint(equalTo: leadingAnchor, constant: 12),
            stackView.trailingAnchor.constraint(equalTo: trailingAnchor, constant: -12),
            stackView.topAnchor.constraint(equalTo: topAnchor, constant: 6),
            stackView.bottomAnchor.constraint(equalTo: bottomAnchor, constant: -6)
        ])

        stackView.addArrangedSubview(iconLabel)
        stackView.addArrangedSubview(smsChip)
        stackView.addArrangedSubview(totpChip)
        let spacer = UIView()
        spacer.setContentHuggingPriority(.defaultLow, for: .horizontal)
        stackView.addArrangedSubview(spacer)
        stackView.addArrangedSubview(hubButton)

        smsChip.addTarget(self, action: #selector(smsTapped), for: .touchUpInside)
        totpChip.addTarget(self, action: #selector(totpTapped), for: .touchUpInside)
        hubButton.addTarget(self, action: #selector(hubTapped), for: .touchUpInside)

        updateVisibility()

        // Separator line at top
        let separator = UIView()
        separator.backgroundColor = .separator
        separator.translatesAutoresizingMaskIntoConstraints = false
        addSubview(separator)
        NSLayoutConstraint.activate([
            separator.topAnchor.constraint(equalTo: topAnchor),
            separator.leadingAnchor.constraint(equalTo: leadingAnchor),
            separator.trailingAnchor.constraint(equalTo: trailingAnchor),
            separator.heightAnchor.constraint(equalToConstant: 0.5)
        ])
    }

    private func updateVisibility() {
        smsChip.isHidden = smsCode == nil
        totpChip.isHidden = totpCode == nil
    }

    @objc private func smsTapped() {
        guard let code = smsCode else { return }
        onSMSTap?(code)
    }

    @objc private func totpTapped() {
        guard let code = totpCode else { return }
        onTOTPTap?(code)
    }

    @objc private func hubTapped() {
        onHubTap?()
    }
}

// MARK: – OTPChipView

final class OTPChipView: UIControl {
    private let codeLabel = UILabel()
    private let typeLabel = UILabel()

    var code: String? {
        didSet { codeLabel.text = code; isHidden = code == nil }
    }

    init(label: String) {
        super.init(frame: .zero)
        typeLabel.text = label
        typeLabel.font = .systemFont(ofSize: 10, weight: .medium)
        typeLabel.textColor = .secondaryLabel

        codeLabel.font = .monospacedDigitSystemFont(ofSize: 16, weight: .semibold)
        codeLabel.textColor = .label

        let stack = UIStackView(arrangedSubviews: [typeLabel, codeLabel])
        stack.axis = .vertical
        stack.spacing = 1
        stack.translatesAutoresizingMaskIntoConstraints = false
        addSubview(stack)
        NSLayoutConstraint.activate([
            stack.leadingAnchor.constraint(equalTo: leadingAnchor, constant: 8),
            stack.trailingAnchor.constraint(equalTo: trailingAnchor, constant: -8),
            stack.topAnchor.constraint(equalTo: topAnchor, constant: 4),
            stack.bottomAnchor.constraint(equalTo: bottomAnchor, constant: -4)
        ])

        backgroundColor = .secondarySystemBackground
        layer.cornerRadius = 8
        layer.masksToBounds = true
    }

    required init?(coder: NSCoder) { fatalError() }

    override var isHighlighted: Bool {
        didSet { alpha = isHighlighted ? 0.6 : 1.0 }
    }
}

// MARK: – TOTPChipView (with countdown ring)

final class TOTPChipView: UIControl {
    private let codeLabel = UILabel()
    private let ringLayer = CAShapeLayer()
    private let trackLayer = CAShapeLayer()
    private let countdownLabel = UILabel()
    private var timer: Timer?

    var code: String? {
        didSet { codeLabel.text = code; isHidden = code == nil }
    }

    var secondsRemaining: Int = 30 {
        didSet { updateRing() }
    }

    init() {
        super.init(frame: .zero)

        // Ring container
        let ringSize: CGFloat = 28
        let ringView = UIView()
        ringView.translatesAutoresizingMaskIntoConstraints = false
        NSLayoutConstraint.activate([
            ringView.widthAnchor.constraint(equalToConstant: ringSize),
            ringView.heightAnchor.constraint(equalToConstant: ringSize)
        ])

        let center = CGPoint(x: ringSize / 2, y: ringSize / 2)
        let radius = ringSize / 2 - 2
        let path = UIBezierPath(arcCenter: center, radius: radius,
                                startAngle: -.pi / 2, endAngle: 3 * .pi / 2,
                                clockwise: true)

        trackLayer.path = path.cgPath
        trackLayer.fillColor = UIColor.clear.cgColor
        trackLayer.strokeColor = UIColor.systemGray4.cgColor
        trackLayer.lineWidth = 2
        ringView.layer.addSublayer(trackLayer)

        ringLayer.path = path.cgPath
        ringLayer.fillColor = UIColor.clear.cgColor
        ringLayer.strokeColor = UIColor.systemYellow.cgColor
        ringLayer.lineWidth = 2
        ringLayer.lineCap = .round
        ringView.layer.addSublayer(ringLayer)

        countdownLabel.font = .systemFont(ofSize: 8, weight: .bold)
        countdownLabel.textColor = .secondaryLabel
        countdownLabel.textAlignment = .center
        countdownLabel.translatesAutoresizingMaskIntoConstraints = false
        ringView.addSubview(countdownLabel)
        NSLayoutConstraint.activate([
            countdownLabel.centerXAnchor.constraint(equalTo: ringView.centerXAnchor),
            countdownLabel.centerYAnchor.constraint(equalTo: ringView.centerYAnchor)
        ])

        codeLabel.font = .monospacedDigitSystemFont(ofSize: 16, weight: .semibold)
        codeLabel.textColor = .label

        let typeLabel = UILabel()
        typeLabel.text = "TOTP"
        typeLabel.font = .systemFont(ofSize: 10, weight: .medium)
        typeLabel.textColor = .secondaryLabel

        let codeStack = UIStackView(arrangedSubviews: [typeLabel, codeLabel])
        codeStack.axis = .vertical
        codeStack.spacing = 1

        let row = UIStackView(arrangedSubviews: [ringView, codeStack])
        row.axis = .horizontal
        row.spacing = 6
        row.alignment = .center
        row.translatesAutoresizingMaskIntoConstraints = false
        addSubview(row)
        NSLayoutConstraint.activate([
            row.leadingAnchor.constraint(equalTo: leadingAnchor, constant: 8),
            row.trailingAnchor.constraint(equalTo: trailingAnchor, constant: -8),
            row.topAnchor.constraint(equalTo: topAnchor, constant: 4),
            row.bottomAnchor.constraint(equalTo: bottomAnchor, constant: -4)
        ])

        backgroundColor = .secondarySystemBackground
        layer.cornerRadius = 8
        layer.masksToBounds = true

        startTimer()
    }

    required init?(coder: NSCoder) { fatalError() }

    private func startTimer() {
        timer = Timer.scheduledTimer(withTimeInterval: 1, repeats: true) { [weak self] _ in
            guard let self else { return }
            self.secondsRemaining = TOTPGenerator.secondsRemaining()
        }
    }

    private func updateRing() {
        let progress = Double(secondsRemaining) / 30.0
        ringLayer.strokeEnd = CGFloat(progress)
        countdownLabel.text = "\(secondsRemaining)"
    }

    deinit { timer?.invalidate() }

    override var isHighlighted: Bool {
        didSet { alpha = isHighlighted ? 0.6 : 1.0 }
    }
}
