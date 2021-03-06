import { COPY_IDENTITY, ExtensionProperty, GraphChild, PropertyType, Texture, TextureInfo, TextureLink, TextureSampler, vec3 } from '@gltf-transform/core';
import { KHR_MATERIALS_SPECULAR } from '../constants';

/** Documentation in {@link EXTENSIONS.md}. */
export class Specular extends ExtensionProperty {
	public readonly propertyType = 'Specular';
	public readonly parentTypes = [PropertyType.MATERIAL];
	public readonly extensionName = KHR_MATERIALS_SPECULAR;
	public static EXTENSION_NAME = KHR_MATERIALS_SPECULAR;

	private _specularFactor = 1.0;
	private _specularColorFactor: vec3 = [1.0, 1.0, 1.0];

	@GraphChild private specularTexture: TextureLink = null;

	public copy(other: this, resolve = COPY_IDENTITY): this {
		super.copy(other, resolve);

		this._specularFactor = other._specularFactor;

		if (other.specularTexture) {
			this.setSpecularTexture(resolve(other.specularTexture.getChild()));
			this.specularTexture.copy(other.specularTexture);
		}

		return this;
	}

	/**********************************************************************************************
	 * Specular.
	 */

	/** Specular; linear multiplier. See {@link getSpecularTexture}. */
	public getSpecularFactor(): number { return this._specularFactor; }

	/** Specular; linear multiplier. See {@link getSpecularTexture}. */
	public setSpecularFactor(specularFactor: number): this {
		this._specularFactor = specularFactor;
		return this;
	}


	/** Specular color; linear multiplier. See {@link getSpecularTexture}. */
	public getSpecularColorFactor(): vec3 { return this._specularColorFactor; }

	/** Specular color; linear multiplier. See {@link getSpecularTexture}. */
	public setSpecularColorFactor(specularColorFactor: vec3): this {
		this._specularColorFactor = specularColorFactor;
		return this;
	}

	/**
	 * Specular texture; linear multiplier. Configures the strength of the specular reflection in
	 * the dielectric BRDF. A value of zero disables the specular reflection, resulting in a pure
	 * diffuse material.
	 *
	 * A 4-channel texture that defines the F0 color of the specular reflection (RGB channels,
	 * encoded in sRGB) and the specular factor (A). Will be multiplied by specularFactor and
	 * specularColorFactor.
	 */
	public getSpecularTexture(): Texture {
		return this.specularTexture ? this.specularTexture.getChild() : null;
	}

	/**
	 * Settings affecting the material's use of its specular texture. If no texture is attached,
	 * {@link TextureInfo} is `null`.
	 */
	public getSpecularTextureInfo(): TextureInfo {
		return this.specularTexture ? this.specularTexture.textureInfo : null;
	}

	/**
	 * Settings affecting the material's use of its specular texture. If no texture is attached,
	 * {@link TextureSampler} is `null`.
	 */
	public getSpecularTextureSampler(): TextureSampler {
		return this.specularTexture ? this.specularTexture.sampler : null;
	}

	/** Sets specular texture. See {@link getSpecularTexture}. */
	public setSpecularTexture(texture: Texture): this {
		this.specularTexture = this.graph.linkTexture('specularTexture', this, texture);
		return this;
	}
}
