import Landing from './pages/Landing';
import Champions from './pages/Champions';
import IndustryDetail from './pages/IndustryDetail';

export const PAGES = {
    "Landing": Landing,
    "app": Champions,
    "industry/:slug": IndustryDetail,
}

export const pagesConfig = {
    mainPage: "Landing",
    Pages: PAGES,
};