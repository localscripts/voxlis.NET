tailwind.config = {
	theme: {
		extend: {
			fontFamily: {
				// voxlis: ["Voxlis", "ui-sans-serif", "system-ui", "sans-serif"],
				primary: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
			},

			colors: {
				/* core surfaces */
				bg: "rgb(var(--bg) / <alpha-value>)",
				fg: "rgb(var(--fg) / <alpha-value>)",

				surface: "rgb(var(--surface) / <alpha-value>)",
				border: "rgb(var(--border) / <alpha-value>)",
				muted: "rgb(var(--muted) / <alpha-value>)",

				/* voxlis primary colours */
				primary: "rgb(var(--primary) / <alpha-value>)",
				"primary-hover": "rgb(var(--primary-hover) / <alpha-value>)",
				"primary-soft": "rgb(var(--primary-soft) / <alpha-value>)",
				"primary-border": "rgb(var(--primary-border) / <alpha-value>)",
				"primary-glow": "rgb(var(--primary-glow) / <alpha-value>)",
			},

			boxShadow: {
				glow: "0 0 20px rgb(var(--primary) / 0.5)",
				// soft: "0 10px 30px rgb(0 0 0 / 0.4)",
			},

			borderRadius: {
				card: "0.75rem",
			},

			maxWidth: {
				content: "120rem",
			},
		}
	},
};