import "@testing-library/jest-dom";
import i18n from "../i18n";

// Force zh-CN for tests so assertions match translation keys
i18n.changeLanguage("zh-CN");
