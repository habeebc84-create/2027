import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useApp } from "../context/AppContext";
function renderInline(text) {
  const parts = String(text).split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.length > 4 && part.startsWith("**") && part.endsWith("**")) {
      return /* @__PURE__ */ _jsx("strong", { className: "text-ivory", children: part.slice(2, -2) }, i);
    }
    return part;
  });
}
function renderSectionContent(content) {
  const blocks = String(content || "").split(/\n\s*\n/).map((b) => b.trim()).filter(Boolean);
  return blocks.map((block, bi) => {
    const lines = block.split("\n").map((l) => l.trim()).filter(Boolean);
    const isList = lines.length > 0 && lines.every((l) => l.startsWith("- "));
    if (isList) {
      return /* @__PURE__ */ _jsx("ul", { className: "list-disc pl-5 mt-3 space-y-1 leading-relaxed", children: lines.map((l, li) => /* @__PURE__ */ _jsx("li", { children: renderInline(l.slice(2)) }, li)) }, bi);
    }
    return /* @__PURE__ */ _jsx("p", { className: bi === 0 ? "leading-relaxed" : "leading-relaxed mt-3", children: renderInline(block.replace(/\n/g, " ")) }, bi);
  });
}
function Terms() {
  const { setPage, termsContent } = useApp();
  return /* @__PURE__ */ _jsx("div", { className: "py-12 bg-transparent min-h-screen relative z-10 break-words", children: /* @__PURE__ */ _jsxs("div", { className: "max-w-4xl mx-auto px-4 sm:px-6 lg:px-8", children: [
    /* @__PURE__ */ _jsxs("h1", { className: "text-3xl sm:text-4xl font-black text-ivory font-industrial mb-8", children: [
      "Terms & ",
      /* @__PURE__ */ _jsx("span", { className: "bg-gradient-to-r from-brand-400 to-brand-500 bg-clip-text text-transparent", children: "Conditions" })
    ] }),
    /* @__PURE__ */ _jsx("div", { className: "bg-charcoal border border-gunmetal rounded-3xl p-6 sm:p-10 space-y-8 text-sm text-silver", children: termsContent.map((t) => /* @__PURE__ */ _jsxs("div", { children: [
      /* @__PURE__ */ _jsx("h2", { className: "text-lg font-bold text-ivory mb-3", children: t.title }),
      renderSectionContent(t.content)
    ] }, t.id)) }),
    /* @__PURE__ */ _jsx("button", { onClick: () => setPage("home"), className: "mt-8 btn-brand font-bold px-6 py-3 rounded-xl text-sm transition", children: "Back to Home" })
  ] }) });
}
export {
  Terms as default
};
