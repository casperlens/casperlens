import { defineConfig } from "vitepress";

// https://vitepress.dev/reference/site-config
export default defineConfig({
	title: "CasperLens Docs",
	description: "Documentation for CasperLens",
	themeConfig: {
		// https://vitepress.dev/reference/default-theme-config
		nav: [
			{ text: "Home", link: "/" },
			{ text: "Docs", link: "/docs/intro" },
		],

		sidebar: [
			{
				text: "Introduction",
				link: "/docs/intro",
			},
			{
				text: "Usage",
				link: "/docs/usage/",
			},
			{
				text: "Features",
				items: [
					{
						text: "Smart Contract Registration",
						link: "/docs/features/registration",
					},
					{
						text: "Smart Contract Tracking",
						link: "/docs/features/tracking",
					},
					{
						text: "Contract Version Analysis",
						link: "/docs/features/version-analysis",
					},
					{
						text: "Intelligent Analysis",
						link: "/docs/features/intelligent-analysis",
					},
					{
						text: "Smart Contract Insights",
						link: "/docs/features/contract-insights",
					},
				],
			},
			{
				text: "Contributing",
				items: [
					{
						text: "Get Started",
						link: "/docs/contributing/",
					},
					{
						text: "Development",
						link: "/docs/contributing/development",
					},
				],
			},
		],

		socialLinks: [
			{ icon: "github", link: "https://github.com/casperlens/casperlens" },
			{ icon: "discord", link: "https://discord.gg/FMZHCG4cqH" },
		],
	},
});
