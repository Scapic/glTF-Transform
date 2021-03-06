import { Extension, ReaderContext, WriterContext } from '@gltf-transform/core';
import { KHR_MATERIALS_UNLIT } from '../constants';
import { Unlit } from './unlit';

const NAME = KHR_MATERIALS_UNLIT;

/** Documentation in {@link EXTENSIONS.md}. */
export class MaterialsUnlit extends Extension {
	public readonly extensionName = NAME;
	public static readonly EXTENSION_NAME = NAME;

	public createUnlit(): Unlit {
		return new Unlit(this.doc.getGraph(), this);
	}

	public read(context: ReaderContext): this {
		const materialDefs = context.nativeDocument.json.materials || [];
		materialDefs.forEach((materialDef, materialIndex) => {
			if (materialDef.extensions && materialDef.extensions[NAME]) {
				context.materials[materialIndex].setExtension(Unlit, this.createUnlit());
			}
		});

		return this;
	}

	public write(context: WriterContext): this {
		const nativeDoc = context.nativeDocument;

		this.doc.getRoot()
			.listMaterials()
			.forEach((material) => {
				if (material.getExtension(Unlit)) {
					const materialIndex = context.materialIndexMap.get(material);
					const materialDef = nativeDoc.json.materials[materialIndex];
					materialDef.extensions = materialDef.extensions || {};
					materialDef.extensions[NAME] = {};
				}
			});

		return this;
	}
}
