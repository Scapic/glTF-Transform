import { GLB_BUFFER } from '../constants';
import { Document } from '../document';
import { Extension } from '../extension';
import { NativeDocument } from '../native-document';
import { BufferUtils } from '../utils/';
import { GLTFReader } from './reader';
import { GLTFWriter, WriterOptions } from './writer';

/**
 * # PlatformIO
 *
 * *Abstract I/O service.*
 *
 * For platform-specific implementations, see {@link NodeIO} and {@link WebIO}.
 *
 * @category I/O
 */
export abstract class PlatformIO {

	protected _extensions: typeof Extension[] = [];

	/** Registers extensions, enabling I/O class to read and write glTF assets requiring them. */
	public registerExtensions(extensions: typeof Extension[]): this {
		this._extensions.push(...extensions);
		return this;
	}

	/** Converts glTF-formatted JSON and a resource map to a {@link Document}. */
	public createDocument (nativeDoc: NativeDocument): Document {
		return GLTFReader.read(nativeDoc, {extensions: this._extensions});
	}

	/** Converts a {@link Document} to glTF-formatted JSON and a resource map. */
	public createNativeDocument (doc: Document, options: WriterOptions): NativeDocument {
		if (options.isGLB && doc.getRoot().listBuffers().length !== 1) {
			throw new Error('GLB must have exactly 1 buffer.');
		}
		return GLTFWriter.write(doc, options);
	}

	/** Converts a GLB-formatted ArrayBuffer to a {@link NativeDocument}. */
	public unpackGLBToNativeDocument(glb: ArrayBuffer): NativeDocument {
		// Decode and verify GLB header.
		const header = new Uint32Array(glb, 0, 3);
		if (header[0] !== 0x46546C67) {
			throw new Error('Invalid glTF asset.');
		} else if (header[1] !== 2) {
			throw new Error(`Unsupported glTF binary version, "${header[1]}".`);
		}

		// Decode and verify chunk headers.
		const jsonChunkHeader = new Uint32Array(glb, 12, 2);
		const jsonByteOffset = 20;
		const jsonByteLength = jsonChunkHeader[0];
		const binaryChunkHeader = new Uint32Array(glb, jsonByteOffset + jsonByteLength, 2);
		if (jsonChunkHeader[1] !== 0x4E4F534A || binaryChunkHeader[1] !== 0x004E4942) {
			throw new Error('Unexpected GLB layout.');
		}

		// Decode content.
		const jsonText = BufferUtils.decodeText(
			glb.slice(jsonByteOffset, jsonByteOffset + jsonByteLength)
		);
		const json = JSON.parse(jsonText) as GLTF.IGLTF;
		const binaryByteOffset = jsonByteOffset + jsonByteLength + 8;
		const binaryByteLength = binaryChunkHeader[0];
		const binary = glb.slice(binaryByteOffset, binaryByteOffset + binaryByteLength);

		return {json, resources: {[GLB_BUFFER]: binary}};
	}

	/** Converts a GLB-formatted ArrayBuffer to a {@link Document}. */
	public unpackGLB(glb: ArrayBuffer): Document {
		return this.createDocument(this.unpackGLBToNativeDocument(glb));
	}

	/** Converts a {@link Document} to a GLB-formatted ArrayBuffer. */
	public packGLB(doc: Document): ArrayBuffer {
		const {json, resources} = this.createNativeDocument(doc, {basename: '', isGLB: true});

		const jsonText = JSON.stringify(json);
		const jsonChunkData = BufferUtils.pad( BufferUtils.encodeText(jsonText), 0x20 );
		const jsonChunkHeader = new Uint32Array([jsonChunkData.byteLength, 0x4E4F534A]).buffer;
		const jsonChunk = BufferUtils.concat([jsonChunkHeader, jsonChunkData]);

		const binaryChunkData = BufferUtils.pad(Object.values(resources)[0] || new ArrayBuffer(0), 0x00);
		const binaryChunkHeader = new Uint32Array([binaryChunkData.byteLength, 0x004E4942]).buffer;
		const binaryChunk = BufferUtils.concat([binaryChunkHeader, binaryChunkData]);

		const header = new Uint32Array([
			0x46546C67, 2, 12 + jsonChunk.byteLength + binaryChunk.byteLength
		]).buffer;

		return BufferUtils.concat([header, jsonChunk, binaryChunk]);
	}
}
