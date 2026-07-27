import { o as isESMImportedImage, r as verifyOptions, t as baseService } from "./service_Bn8KhhJO.mjs";
//#region node_modules/.pnpm/astro@7.1.3_@astrojs+markdown-remark@7.2.1_@emnapi+core@1.11.1_@emnapi+runtime@1.11.1_@types+_em55262aao2ehykmzmh5nxb4si/node_modules/astro/dist/assets/services/noop.js
var noop_default = {
	...baseService,
	propertiesToHash: ["src"],
	async validateOptions(options) {
		if (isESMImportedImage(options.src) && options.src.format === "svg") options.format = "svg";
		else delete options.format;
		verifyOptions(options);
		return options;
	},
	async transform(inputBuffer, transformOptions) {
		return {
			data: inputBuffer,
			format: transformOptions.format
		};
	}
};
//#endregion
export { noop_default as default };
