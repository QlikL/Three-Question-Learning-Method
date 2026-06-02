const MathRenderer = {
    _GREEK_MAP: {
        '\\alpha': '\u03B1', '\\beta': '\u03B2', '\\gamma': '\u03B3', '\\delta': '\u03B4',
        '\\epsilon': '\u03B5', '\\varepsilon': '\u03B5', '\\zeta': '\u03B6', '\\eta': '\u03B7',
        '\\theta': '\u03B8', '\\vartheta': '\u03D1', '\\iota': '\u03B9', '\\kappa': '\u03BA',
        '\\lambda': '\u03BB', '\\mu': '\u03BC', '\\nu': '\u03BD', '\\xi': '\u03BE',
        '\\pi': '\u03C0', '\\varpi': '\u03D6', '\\rho': '\u03C1', '\\varrho': '\u03F1',
        '\\sigma': '\u03C3', '\\varsigma': '\u03C2', '\\tau': '\u03C4', '\\upsilon': '\u03C5',
        '\\phi': '\u03D5', '\\varphi': '\u03C6', '\\chi': '\u03C7', '\\psi': '\u03C8',
        '\\omega': '\u03C9',
        '\\Alpha': '\u0391', '\\Beta': '\u0392', '\\Gamma': '\u0393', '\\Delta': '\u0394',
        '\\Theta': '\u0398', '\\Lambda': '\u039B', '\\Xi': '\u039E', '\\Pi': '\u03A0',
        '\\Sigma': '\u03A3', '\\Phi': '\u03A6', '\\Psi': '\u03A8', '\\Omega': '\u03A9'
    },

    _SYMBOL_MAP: {
        '\\infty': '\u221E', '\\partial': '\u2202', '\\nabla': '\u2207',
        '\\pm': '\u00B1', '\\mp': '\u2213', '\\times': '\u00D7', '\\div': '\u00F7',
        '\\cdot': '\u22C5', '\\ast': '\u2217', '\\star': '\u2605',
        '\\leq': '\u2264', '\\geq': '\u2265', '\\neq': '\u2260',
        '\\approx': '\u2248', '\\equiv': '\u2261', '\\sim': '\u223C',
        '\\propto': '\u221D', '\\ll': '\u226A', '\\gg': '\u226B',
        '\\in': '\u2208', '\\notin': '\u2209', '\\subset': '\u2282',
        '\\supset': '\u2283', '\\subseteq': '\u2286', '\\supseteq': '\u2287',
        '\\cup': '\u222A', '\\cap': '\u2229', '\\emptyset': '\u2205',
        '\\forall': '\u2200', '\\exists': '\u2203', '\\neg': '\u00AC',
        '\\land': '\u2227', '\\lor': '\u2228', '\\rightarrow': '\u2192',
        '\\leftarrow': '\u2190', '\\leftrightarrow': '\u2194',
        '\\Rightarrow': '\u21D2', '\\Leftarrow': '\u21D0', '\\Leftrightarrow': '\u21D4',
        '\\rightarrow': '\u2192', '\\uparrow': '\u2191', '\\downarrow': '\u2193',
        '\\int': '\u222B', '\\iint': '\u222C', '\\iiint': '\u222D',
        '\\oint': '\u222E', '\\sum': '\u2211', '\\prod': '\u220F',
        '\\coprod': '\u2210', '\\bigcup': '\u22C3', '\\bigcap': '\u22C2',
        '\\sqrt': '\u221A', '\\triangle': '\u25B3', '\\angle': '\u2220',
        '\\perp': '\u22A5', '\\parallel': '\u2225', '\\mid': '\u2223',
        '\\ell': '\u2113', '\\Re': '\u211C', '\\Im': '\u2111',
        '\\aleph': '\u2135', '\\hbar': '\u210F',
        '\\to': '\u2192', '\\mapsto': '\u21A6',
        '\\log': 'log', '\\ln': 'ln', '\\sin': 'sin', '\\cos': 'cos',
        '\\tan': 'tan', '\\cot': 'cot', '\\sec': 'sec', '\\csc': 'csc',
        '\\arcsin': 'arcsin', '\\arccos': 'arccos', '\\arctan': 'arctan',
        '\\max': 'max', '\\min': 'min', '\\lim': 'lim', '\\sup': 'sup',
        '\\inf': 'inf', '\\det': 'det', '\\gcd': 'gcd', '\\Pr': 'Pr',
        '\\exp': 'exp', '\\ker': 'ker', '\\dim': 'dim',
        '\\mathrm': '', '\\mathbf': '', '\\text': '', '\\operatorname': '',
        '\\,': '', '\\;': '', '\\!': '', '\\quad': ' ', '\\qquad': '  ',
        '\\hspace{1em}': ' ', '\\hspace{0.5em}': ' '
    },

    _convertCommand(latex) {
        let result = latex;

        for (const [cmd, unicode] of Object.entries(this._SYMBOL_MAP)) {
            const escaped = cmd.replace(/\\/g, '\\\\');
            result = result.replace(new RegExp(escaped + '(?=[^a-zA-Z]|$)', 'g'), unicode);
        }
        for (const [cmd, unicode] of Object.entries(this._GREEK_MAP)) {
            const escaped = cmd.replace(/\\/g, '\\\\');
            result = result.replace(new RegExp(escaped + '(?=[^a-zA-Z]|$)', 'g'), unicode);
        }

        result = result.replace(/\^\\{([^}]+)\}/g, '<sup>$1</sup>');
        result = result.replace(/\^([^{\s])/g, '<sup>$1</sup>');
        result = result.replace(/_\\{([^}]+)\}/g, '<sub>$1</sub>');
        result = result.replace(/_([^{\s])/g, '<sub>$1</sub>');

        result = result.replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '($1/$2)');
        result = result.replace(/\\sqrt\{([^}]+)\}/g, '\u221A($1)');
        result = result.replace(/\\overline\{([^}]+)\}/g, '<span style="text-decoration:overline">$1</span>');
        result = result.replace(/\\underline\{([^}]+)\}/g, '<span style="text-decoration:underline">$1</span>');

        result = result.replace(/[{}\\]/g, '');

        return result;
    },

    _renderDisplayMath(latex) {
        const rendered = this._convertCommand(latex);
        return '<div class="math-display">' + rendered + '</div>';
    },

    _renderInlineMath(latex) {
        const rendered = this._convertCommand(latex);
        return '<span class="math-inline">' + rendered + '</span>';
    },

    _extractMath(text) {
        const placeholders = {};
        let counter = 0;
        const makeKey = () => '%%MATH_' + (counter++) + '%%';

        text = text.replace(/\$\$([\s\S]+?)\$\$/g, (_, latex) => {
            const key = makeKey();
            placeholders[key] = this._renderDisplayMath(latex.trim());
            return key;
        });

        text = text.replace(/\\\[([\s\S]+?)\\\]/g, (_, latex) => {
            const key = makeKey();
            placeholders[key] = this._renderDisplayMath(latex.trim());
            return key;
        });

        text = text.replace(/\\\((.+?)\\\)/g, (_, latex) => {
            const key = makeKey();
            placeholders[key] = this._renderInlineMath(latex.trim());
            return key;
        });

        text = text.replace(/\$(?!\$)((?:[^$\\]|\\.)+?)\$/g, (_, latex) => {
            const trimmed = latex.trim();
            if (!trimmed) return _;
            const key = makeKey();
            placeholders[key] = this._renderInlineMath(trimmed);
            return key;
        });

        return { text, placeholders };
    },

    _restoreMath(html, placeholders) {
        for (const [key, rendered] of Object.entries(placeholders)) {
            html = html.split(key).join(rendered);
        }
        return html;
    },

    renderElement(element) {
        if (!element) return;
        const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
        const textNodes = [];
        while (walker.nextNode()) textNodes.push(walker.currentNode);

        for (const node of textNodes) {
            const text = node.textContent;
            if (!text.includes('$')) continue;

            const { text: converted, placeholders } = this._extractMath(text);
            if (Object.keys(placeholders).length === 0) continue;

            const span = document.createElement('span');
            let html = this._escapeHtml(converted);
            html = this._restoreMath(html, placeholders);
            span.innerHTML = html;
            node.parentNode.replaceChild(span, node);
        }
    },

    _escapeHtml(str) {
        return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }
};
