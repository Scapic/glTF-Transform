!function(e,f){"object"==typeof exports&&"undefined"!=typeof module?f(exports,require("gltf-transform"),require("buffer-splice")):"function"==typeof define&&define.amd?define(["exports","gltf-transform","buffer-splice"],f):f(e.gltfTransformSplit={},e.gltfTransform,e.splice)}(this,function(e,f,r){r=r&&r.hasOwnProperty("default")?r.default:r;e.split=function(e,t){var n=e.json,u=f.GLTFUtil.createLogger("gltf-transform-split",f.LoggerVerbosity.INFO);n.buffers.forEach(function(e,r){if(e.uri&&e.uri.match(/^data:/)){var t=e.uri;return e.uri="buffer"+r+".bin",void(e._buffer=f.GLTFUtil.createBufferFromDataURI(t))}throw new Error("Only buffers using Data URIs are currently supported")});var i={};return n.meshes.forEach(function(e){-1!==t.indexOf(e.name)&&e.primitives.forEach(function(f){function r(f){if(void 0===i[f.bufferView])i[f.bufferView]=e.name;else if(i[f.bufferView]!==e.name)throw new Error("Not implemented: Two meshes share a bufferview.")}f.indices&&r(n.accessors[f.indices]),Object.keys(f.attributes).forEach(function(e){r(n.accessors[f.attributes[e]])})})}),t.forEach(function(e){var t=f.GLTFUtil.createBuffer();u.info("📦  "+e),n.bufferViews.forEach(function(f,b){if(i[b]===e){u.info(e+":"+b),u.info("original before: "+n.buffers[f.buffer]._buffer.byteLength+" w/ offset "+f.byteOffset+" and length "+f.byteLength);var o={buffer:n.buffers[f.buffer]._buffer},s=r(o,f.byteOffset,f.byteLength);u.info("spliced: "+s.byteLength),n.buffers[f.buffer]._buffer=o.buffer,u.info("original after: "+n.buffers[f.buffer]._buffer.byteLength);var a=f.byteOffset+f.byteLength,c=f.buffer;f.byteOffset=t.byteLength,f.buffer=n.buffers.length,t=r(t,null,null,s),n.bufferViews.forEach(function(e){e.buffer===c&&e.byteOffset>=a&&(e.byteOffset-=f.byteLength)})}});var b={uri:e+".bin",byteLength:void 0};b._buffer=t,n.buffers.push(b)}),n.buffers=n.buffers.filter(function(e,f){return e.byteLength=e._buffer.byteLength,delete e._buffer,e.byteLength>0||(n.bufferViews.forEach(function(e){e.buffer>=f&&e.buffer--}),!1)}),e}});
//# sourceMappingURL=gltf-transform-split.umd.js.map