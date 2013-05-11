require.config({
	baseUrl: "/js"
});
require([
	'goo/entities/GooRunner',
	'goo/entities/EntityUtils',
	'goo/renderer/Material',
	'goo/renderer/Camera',
	'goo/entities/components/CameraComponent',
	'goo/shapes/ShapeCreator',
	'goo/renderer/TextureCreator',
	'goo/entities/components/ScriptComponent',
	'goo/entities/components/CSSTransformComponent',
	'goo/entities/components/MeshDataComponent',
	'goo/math/Vector3',
	'goo/math/Vector',
	'goo/scripts/OrbitCamControlScript',
	'goo/renderer/shaders/ShaderLib',
	'goo/loaders/JSONImporter',
	'goo/renderer/MeshData',
	'goo/renderer/Shader',
	'goo/scripts/WASDControlScript',
	'goo/scripts/MouseLookControlScript',
	'goo/renderer/Texture',
	'goo/renderer/pass/RenderTarget',
	'goo/renderer/pass/FullscreenPass',
	'goo/renderer/Util',
	'goo/util/FastBuilder',
	'goo/math/Transform',
	'goo/math/Vector4',
	'goo/entities/components/MeshRendererComponent',
	'goo/scripts/SplineInterpolator'
], function(
	GooRunner,
	EntityUtils,
	Material,
	Camera,
	CameraComponent,
	ShapeCreator,
	TextureCreator,
	ScriptComponent,
	CSSTransformComponent,
	MeshDataComponent,
	Vector3,
	Vector,
	OrbitCamControlScript,
	ShaderLib,
	JSONImporter,
	MeshData,
	Shader,
	WASDControlScript,
	MouseLookControlScript,
	Texture,
	RenderTarget,
	FullscreenPass,
	Util,
	FastBuilder,
	Transform,
	Vector4,
	MeshRendererComponent,
	SplineInterpolator
) {
	"use strict";

	var initialPosition = [2000, 750, 2000];
	var initialLookAt = [-600, 0, -600];
	var videoPosition = [0, 575, 575];
	var videoLookAt = [-575, 575, 575];
	var webcamPosition = [100, 575, 100];
	var webcamLookAt = [-575, 575, -575];
	var browserPosition = [575, 575, 0];
	var browserLookAt = [575, 575, -575];
	var statuePosition = [1500, 450, 1500];
	var statueLookAt = [30, 100, 10];


	//var resourcePath = "resources/";
  var resourcePath = "http://localhost/resources/"

	var screen1mat, screen2mat, screen3mat;
	var target, coolPass, canvasMaterial;

	function init() {
		var goo = new GooRunner({
			antialias: true
		});
		goo.renderer.domElement.id = 'goo';
		document.body.appendChild(goo.renderer.domElement);
		goo.renderer.setClearColor(0.1, 0.1, 0.1, 1.0);

		var focusPoint = new Vector3(initialLookAt);

		var cameraEntity = goo.world.createEntity('CameraEntity');
		cameraEntity.setComponent(new CameraComponent(new Camera(30, 1, 10, 100000)));
		cameraEntity.transformComponent.transform.translation.set(initialPosition);
		cameraEntity.transformComponent.transform.lookAt(initialLookAt, Vector3.UNIT_Y);
		cameraEntity.addToWorld();

		var scriptComponent = new ScriptComponent();
		cameraEntity.setComponent(scriptComponent);

		loadScene(goo);

		var removeDatGui = function () {
			var root = document.querySelector('div.dg.ac');

			if (root) {
				while (root && root.firstChild) {
					root.removeChild(root.firstChild);
				}
			}
		};

		var buttons = document.querySelectorAll('#buttons > .button');

		var moving = false;

		var actions = [
			function (event) {
				if (!moving) {
					moving = true;
					document.querySelector('#filters').classList.remove('visible');
					removeDatGui();

					var sc = cameraEntity.getComponent('scriptComponent');
					sc.scripts.push(new SplineInterpolator(
					{
						'controlPoints' :
						[
							{ 'time' : 2.0, 'value' : videoPosition }
						],
						'beforeFunction' : function (entity) {
							return entity.transformComponent.transform.translation.clone().data;
						},
						'updateFunction' : function (entity, array) {
							entity.transformComponent.transform.translation.set(array);
							entity.transformComponent.setUpdated();
						}
					}));
					sc.scripts.push(new SplineInterpolator(
					{
						'controlPoints' :
						[
							{ 'time' : 2.0, 'value' : videoLookAt }
						],
						'beforeFunction' : function (entity) {
							return focusPoint.clone().data;
						},
						'updateFunction' : function (entity, array) {
							focusPoint.set(array);
							entity.transformComponent.transform.lookAt(array, Vector3.UNIT_Y);
							entity.transformComponent.setUpdated();
						},
						'afterFunction' : function (entity) {
							moving = false;
							if (screen1mat.textures[0]) {
								screen1mat.textures[0].image.play();
							} else {
								screen1mat.textures[0] = new TextureCreator().loadTextureVideo('../resources/imagination.ogv', false);
							}
						}
					}));
				}

				event.stopPropagation();
			},
			function (event) {
				if (!moving) {
					moving = true;

					if (screen1mat.textures[0]) {
						screen1mat.textures[0].image.pause();
					}

					var sc = cameraEntity.getComponent('scriptComponent');
					sc.scripts.push(new SplineInterpolator(
					{
						'controlPoints' :
						[
							{ 'time' : 2.0, 'value' : webcamPosition }
						],
						'beforeFunction' : function (entity) {
							return entity.transformComponent.transform.translation.clone().data;
						},
						'updateFunction' : function (entity, array) {
							entity.transformComponent.transform.translation.set(array);
							entity.transformComponent.setUpdated();
						}
					}));
					sc.scripts.push(new SplineInterpolator(
					{
						'controlPoints' :
						[
							{ 'time' : 2.0, 'value' : webcamLookAt }
						],
						'beforeFunction' : function (entity) {
							return focusPoint.clone().data;
						},
						'updateFunction' : function (entity, array) {
							focusPoint.set(array);
							entity.transformComponent.transform.lookAt(array, Vector3.UNIT_Y);
							entity.transformComponent.setUpdated();
						},
						'afterFunction' : function (entity) {
							moving = false;

							if (screen2mat.textures[0] === undefined) {
								screen2mat.textures[0] = new TextureCreator().loadTextureWebCam();
								screen2mat.textures[0].magFilter = 'NearestNeighbor';
								screen2mat.textures[0].minFilter = 'NearestNeighborNoMipMaps';
								screen2mat.textures[0].generateMipmaps = false;

								canvasMaterial.textures[0] = screen2mat;

								(function(texture) {
									goo.callbacksPreRender.push(function() {
										if (texture.image && texture.image.dataReady) {
											coolPass.render(goo.renderer, target, texture);
											screen2mat.textures[0] = target;
										}
									});
								})(screen2mat.textures[0]);
							}

							document.querySelector('#filters').classList.add('visible');
						}
					}));
				}
				event.stopPropagation();
			},
			function (event) {
				if (!moving) {
					moving = true;
					document.querySelector('#filters').classList.remove('visible');
					removeDatGui();

					if (screen1mat.textures[0]) {
						screen1mat.textures[0].image.pause();
					}

					var sc = cameraEntity.getComponent('scriptComponent');
					sc.scripts.push(new SplineInterpolator(
					{
						'controlPoints' :
						[
							{ 'time' : 2.0, 'value' : browserPosition }
						],
						'beforeFunction' : function (entity) {
							return entity.transformComponent.transform.translation.clone().data;
						},
						'updateFunction' : function (entity, array) {
							entity.transformComponent.transform.translation.set(array);
							entity.transformComponent.setUpdated();
						}
					}));
					sc.scripts.push(new SplineInterpolator(
					{
						'controlPoints' :
						[
							{ 'time' : 2.0, 'value' : browserLookAt }
						],
						'beforeFunction' : function (entity) {
							return focusPoint.clone().data;
						},
						'updateFunction' : function (entity, array) {
							focusPoint.set(array);
							entity.transformComponent.transform.lookAt(array, Vector3.UNIT_Y);
							entity.transformComponent.setUpdated();
						},
						'afterFunction' : function (entity) {
							moving = false;
						}
					}));
				}

				event.stopPropagation();
			},
			function (event) {
				if (!moving) {
					moving = true;
					document.querySelector('#filters').classList.remove('visible');
					removeDatGui();

					if (screen1mat.textures[0]) {
						screen1mat.textures[0].image.pause();
					}

					var sc = cameraEntity.getComponent('scriptComponent');
					sc.scripts.push(new SplineInterpolator(
					{
						'controlPoints' :
						[
							{ 'time' : 2.0, 'value' : statuePosition }
						],
						'beforeFunction' : function (entity) {
							return entity.transformComponent.transform.translation.clone().data;
						},
						'updateFunction' : function (entity, array) {
							entity.transformComponent.transform.translation.set(array);
							entity.transformComponent.setUpdated();
						}
					}));
					sc.scripts.push(new SplineInterpolator(
					{
						'controlPoints' :
						[
							{ 'time' : 2.0, 'value' : statueLookAt }
						],
						'beforeFunction' : function (entity) {
							return focusPoint.clone().data;
						},
						'updateFunction' : function (entity, array) {
							focusPoint.set(array);
							entity.transformComponent.transform.lookAt(array, Vector3.UNIT_Y);
							entity.transformComponent.setUpdated();
						},
						'afterFunction' : function (entity) {
							moving = false;
						}
					}));
				}

				event.stopPropagation();
			}
		];

		for (var i = 0; i < buttons.length; i++) {
			buttons[i].addEventListener('mousedown', actions[i]);
			buttons[i].addEventListener('touchstart', actions[i]);
		}
	}

	function loadScene(goo) {
		createShapes(goo);

		var importer = new JSONImporter(goo.world);

		var ctx, canvas;

		target = new RenderTarget(512, 512);
		coolPass = new FullscreenPass(ShaderLib.dotscreen);





		var filters = [
			{ 'title' : 'Sepia', 'shader' : 'sepia' },
			{ 'title' : 'Half tone', 'shader' : 'dotscreen' },
			{ 'title' : 'Vignette', 'shader' : 'vignette' },
			{ 'title' : 'Film grain', 'shader' : 'film' },
			{ 'title' : 'Bleach', 'shader' : 'bleachbypass' },
			{ 'title' : 'Tilt shift', 'shader' : 'horizontalTiltShift' },
			{ 'title' : 'Colorify', 'shader' : 'colorify' },
			{ 'title' : 'Compute normals', 'shader' : 'normalmap' },
			{ 'title' : 'Channel shift', 'shader' : 'rgbshift' },
			{ 'title' : 'Brightness and contrast', 'shader' : 'brightnesscontrast' }
		];

		var root = document.querySelector('#filters > .dialog > div');

		var action = function (event) {
			event.stopPropagation();
		};

		root.addEventListener('mousedown', action);
		root.addEventListener('touchstart', action);

		filters.map(function (filter) {
			var element = document.createElement('h3');

			element.textContent = filter.title;
			element.className = 'button';

			var action = function (event) {
				buildControlsForFilter(filter.shader);
			};

			element.addEventListener('mousedown', action);
			element.addEventListener('touchstart', action);

			root.appendChild(element);
		});

		var buildControlsForFilter = function(name) {
			coolPass.material = Material.createMaterial(Util.clone(ShaderLib[name]));
			coolPass.renderable.materials = [coolPass.material];

			var root = document.querySelector('div.dg.ac');

			while (root && root.firstChild) {
				root.removeChild(root.firstChild);
			}

			var gui = new window.dat.GUI();

			var action = function (event) {
				event.stopPropagation();
			};

			gui.domElement.addEventListener('mousedown', action);
			gui.domElement.addEventListener('touchstart', action);

			var uniforms = coolPass.material.shader.uniforms;

			var proxies = {};

			var arrayHandle = function(value) {
				var valueArray = value.split(',');
				for (var i = 0; i < valueArray.length; i++) {
					valueArray[i] = parseFloat(valueArray[i]);
				}
				// WARNING Hack-ish, but meh, it's just a demo
				uniforms[this.property] = valueArray;
			};
			var colorHandle = function(value) {
				uniforms.color = [proxies.red, proxies.green, proxies.blue];
			};
			var grayscaleHandle = function(value) {
				uniforms.grayscale = value;
			};
			for (var key in uniforms) {
				console.log(keuy, uniforms[key]);

				if (uniforms[key] instanceof Array) {
					// WARNING Hack-ish, but meh, it's just a demo
					if (name === 'colorify' && key === 'color') {
						// gui.addColor(uniforms, key);

						proxies.red = uniforms[key][0];
						proxies.green = uniforms[key][1];
						proxies.blue = uniforms[key][2];

						gui.add(proxies, 'red', 0, 1).onChange(colorHandle).step(0.01);
						gui.add(proxies, 'green', 0, 1).onChange(colorHandle).step(0.01);
						gui.add(proxies, 'blue', 0, 1).onChange(colorHandle).step(0.01);
					} else {
						proxies[key] = uniforms[key].toString();
						gui.add(proxies, key).onFinishChange(arrayHandle);
					}
				} else if (uniforms[key] instanceof Object) {
					console.log("Nested object, can't display ", uniforms[key]);
				} else {
					if (typeof(uniforms[key]) === 'string') {
						console.log('Skipping string option ', key);
					} else {
						var num = parseFloat(uniforms[key]);
						if (name === 'film' && key === 'grayscale') {
							proxies.grayscale = false;
							gui.add(proxies, 'grayscale').onChange(grayscaleHandle);
						} else if (!isNaN(num)) {
							gui.add(uniforms, key, 0.0, Math.max(1.0, num));
						} else {
							gui.add(uniforms, key);
						}
					}
				}
			}
		};


		canvasMaterial = Material.createMaterial(ShaderLib.textured, 'art');
    debugger;
		importer.load(resourcePath + '/model1.json', resourcePath + '/', {
			onSuccess: function(entities) {
				entities[0].transformComponent.transform.scale.set(100, 100, 100);
				for (var i in entities) {
					entities[i].addToWorld();
				}
			},
			onError: function(error) {
				console.error(error);
			}
		}, function() {
			var material = Material.createMaterial(roomShader, 'art');
			 material.textures[1] = new TextureCreator().loadTexture2D(resourcePath + '/light_concrete.jpg');
			//material.textures[1] = new TextureCreator().loadTexture2D("https://s3.amazonaws.com/GooStuff/Resources/art-gallery/resources/light_concrete.jpg");
			return material;
		});

		importer.load(resourcePath + '/model2.json', resourcePath + '/', {
			onSuccess: function(entities) {
				entities[0].transformComponent.transform.scale.set(100, 100, 100);
				for (var i in entities) {
					entities[i].addToWorld();

					if (entities[i].meshRendererComponent) {
						var material = entities[i].meshRendererComponent.materials[0];
						material.textures[1] = new TextureCreator().loadTexture2D(resourcePath + '/lavatile.jpg');
						material.textures[0] = new TextureCreator().loadTexture2D(resourcePath + '/cloud.png');
					}
				}
			},
			onError: function(error) {
				console.error(error);
			}
		}, function() {
			var material = Material.createMaterial(modelShader, 'art');
			return material;
		});

		importer.load(resourcePath + '/screen1.json', resourcePath + '/', {
			onSuccess: function(entities) {
				entities[0].transformComponent.transform.scale.set(100, 100, 100);
				for (var i in entities) {
					entities[i].addToWorld();
				}
			},
			onError: function(error) {
				console.error(error);
			}
		}, function() {
			return screen1mat = Material.createMaterial(ShaderLib.textured, 'art');
		});
		importer.load(resourcePath + '/screen2.json', resourcePath + '/', {
			onSuccess: function(entities) {
				entities[0].transformComponent.transform.scale.set(100, 100, 100);
				for (var i in entities) {
					entities[i].addToWorld();
				}
			},
			onError: function(error) {
				console.error(error);
			}
		}, function() {
			return screen2mat = Material.createMaterial(ShaderLib.textured, 'art');
		});
		importer.load(resourcePath + '/screen3.json', resourcePath + '/', {
			onSuccess: function(entities) {
				for (var i in entities) {
					entities[i].addToWorld();

					if (entities[i].meshDataComponent) {
						var entity = entities[i];
						var element = document.createElement('iframe');
						element.setAttribute("src", "//ericrius1.jit.su/art-gallery/");
						element.className = 'object assembly';

						entity.transformComponent.transform.scale.set(0.78, 0.595, 1.0);
						entity.transformComponent.transform.translation.set(950, 975, -1620);
						entity.setComponent(new CSSTransformComponent(element));
					}
				}
			},
			onError: function(error) {
				console.error(error);
			}
		}, function() {
			var material = Material.createMaterial(ShaderLib.simple, 'art');
			return screen3mat = material;
		});

		importer.load(resourcePath + '/canvas.json', resourcePath + '/', {
			onSuccess: function(entities) {
				entities[0].transformComponent.transform.scale.set(100, 100, 100);
				for (var i in entities) {
					entities[i].addToWorld();
				}
			},
			onError: function(error) {
				console.error(error);
			}
		}, function() {
			return canvasMaterial;
		});

	}

	var roomShader = {
		attributes: {
			vertexPosition: MeshData.POSITION,
			vertexUV0: MeshData.TEXCOORD0,
			vertexUV1: MeshData.TEXCOORD1
		},
		uniforms: {
			viewProjectionMatrix: Shader.VIEW_PROJECTION_MATRIX,
			worldMatrix: Shader.WORLD_MATRIX,
			lightMap: Shader.TEXTURE0,
			diffuseMap: Shader.TEXTURE1
		},
		vshader: [ //
		'attribute vec3 vertexPosition;', //
		'attribute vec2 vertexUV0;', //
		'attribute vec2 vertexUV1;', //

		'uniform mat4 viewProjectionMatrix;',
			'uniform mat4 worldMatrix;', //

		'varying vec2 texCoord0;', //
		'varying vec2 texCoord1;', //

		'void main(void) {', //
		'	texCoord0 = vertexUV0 * vec2(10.0, 10.0);', //
		'	texCoord1 = vertexUV1;', //
		'	gl_Position = viewProjectionMatrix * worldMatrix * vec4(vertexPosition, 1.0);', //
		'}' //
		].join('\n'),
		fshader: [ //
		'precision mediump float;', //

		'uniform sampler2D lightMap;', //
		'uniform sampler2D diffuseMap;', //

		'varying vec2 texCoord0;', //
		'varying vec2 texCoord1;', //

		'void main(void)', //
		'{', //
		'	vec4 lightCol = texture2D(lightMap, texCoord1);', //
		'	vec4 diffuseCol = texture2D(diffuseMap, texCoord0);', //
		'	gl_FragColor = lightCol * diffuseCol;',
		'}' //
		].join('\n')
	};

	var modelShader = {
		attributes: {
			vertexPosition: MeshData.POSITION,
			vertexUV1: MeshData.TEXCOORD1
		},
		uniforms: {
			viewProjectionMatrix: Shader.VIEW_PROJECTION_MATRIX,
			worldMatrix: Shader.WORLD_MATRIX,
			texture1: Shader.TEXTURE0,
			texture2: Shader.TEXTURE1,
			time: Shader.TIME,
			fogDensity: 0.0001,
			fogColor: [1, 1, 1]
		},
		vshader: [ //
		'attribute vec3 vertexPosition;', //
		'attribute vec2 vertexUV1;', //

		'uniform mat4 viewProjectionMatrix;',
		'uniform mat4 worldMatrix;', //

		'varying vec2 texCoord0;', //

		'void main(void) {', //
		'	vec4 worldPos = worldMatrix * vec4(vertexPosition, 1.0);', //
		'	gl_Position = viewProjectionMatrix * worldPos;', //
		'	texCoord0 = vertexUV1 * vec2(5.0, 5.0);', //
		'}' //
		].join('\n'),
		fshader: [ //
		'precision mediump float;', //

		'uniform sampler2D texture1;', //
		'uniform sampler2D texture2;', //

		'uniform float time;',
			'uniform float fogDensity;',
			'uniform vec3 fogColor;',

		'varying vec2 texCoord0;', //

		'void main(void)', //
		'{', //

		'vec2 position = -1.0 + 2.0 * texCoord0;',

			'vec4 noise = texture2D( texture1, texCoord0 );',
			'vec2 T1 = texCoord0 + vec2( 1.5, -1.5 ) * time  *0.02;',
			'vec2 T2 = texCoord0 + vec2( -0.5, 2.0 ) * time * 0.01;',

			'T1.x += noise.x * 2.0;',
			'T1.y += noise.y * 2.0;',
			'T2.x -= noise.y * 0.2;',
			'T2.y += noise.z * 0.2;',

			'float p = texture2D( texture1, T1 * 2.0 ).a;',

			'vec4 color = texture2D( texture2, T2 * 2.0 );',
			'vec4 temp = color * ( vec4( p, p, p, p ) * 2.0 ) + ( color * color - 0.1 );',

			'if( temp.r > 1.0 ){ temp.bg += clamp( temp.r - 2.0, 0.0, 100.0 ); }',
			'if( temp.g > 1.0 ){ temp.rb += temp.g - 1.0; }',
			'if( temp.b > 1.0 ){ temp.rg += temp.b - 1.0; }',

			'gl_FragColor = temp;',

			'float depth = gl_FragCoord.z / gl_FragCoord.w;',
			'const float LOG2 = 1.442695;',
			'float fogFactor = exp2( - fogDensity * fogDensity * depth * depth * LOG2 );',
			'fogFactor = 1.0 - clamp( fogFactor, 0.0, 1.0 );',

			'gl_FragColor = mix( gl_FragColor, vec4( fogColor, gl_FragColor.w ), fogFactor );',
		'}' //
		].join('\n')
	};

	function createShapes(goo) {
		var attributeMap = MeshData.defaultMap([MeshData.POSITION, MeshData.NORMAL]);
		attributeMap.movementNormal = MeshData.createAttribute(3, 'Float');
		attributeMap.movementNormal2 = MeshData.createAttribute(3, 'Float');
		attributeMap.offsets = MeshData.createAttribute(4, 'Float');

		var meshData = new MeshData(attributeMap, 8, 36);

		var vbuf = meshData.getAttributeBuffer(MeshData.POSITION);
		var realvbuf = meshData.getAttributeBuffer(MeshData.NORMAL);
		var movementNormal = meshData.getAttributeBuffer('movementNormal');
		var movementNormal2 = meshData.getAttributeBuffer('movementNormal2');
		var offsets = meshData.getAttributeBuffer('offsets');
		var indices = meshData.getIndexBuffer();

		var size = 2.0;
		vbuf.set([
			-size, -size, -size,
			-size, size, -size,
			size, size, -size,
			size, -size, -size,
			-size, -size, size,
			-size, size, size,
			size, size, size,
			size, -size, size
		]);
		realvbuf.set(vbuf);

		indices.set([
					0,1,2, 2,3,0,
					6,5,4, 4,7,6,
					2,1,5, 5,6,2,
					7,4,0, 0,3,7,
					5,1,0, 0,4,5,
					2,6,7, 7,3,2
		]);

		var loader = document.getElementById('load');
		var count = 4000;
		var meshBuilder = new FastBuilder(meshData, count, {
			progress: function (/*percent*/) {
//				console.log(percent);
			},
			done: function () {
				// loader.classList.remove('visible');
			}
		});
		var transform = new Transform();
		var movement = new Vector3();
		var offsetvec = new Vector4();
		var spread = 150.0;
		var x, n;
		for (x=0;x<count;x++) {
			transform.translation.data[0] = Math.sin(x*Math.PI*2/count);
			transform.translation.data[1] = (Math.random() * 2.0 - 1.0) * 0.05;
			transform.translation.data[2] = Math.cos(x*Math.PI*2/count);
			transform.translation.normalize();
			transform.translation.mul(Math.random()*50.0+spread);
			transform.setRotationXYZ(0, Math.random() * Math.PI * 2, 0);

			movement.setv(transform.translation).normalize();
			for (n=0;n<8;n++) {
				movementNormal[n*3+0] = movement.data[0];
				movementNormal[n*3+1] = movement.data[1];
				movementNormal[n*3+2] = movement.data[2];
			}
			movement.cross(Vector3.UNIT_Y);
			for (n=0;n<8;n++) {
				movementNormal2[n*3+0] = movement.data[0];
				movementNormal2[n*3+1] = movement.data[1];
				movementNormal2[n*3+2] = movement.data[2];
			}

			transform.update();

			// var spin = (x/count) * Math.PI * 1;
			// var spin2 = (x/count) * Math.PI * 2.2 * (Math.random()*0.8+0.6);
			var spin = (x/count) * Math.PI * 1.1;
			var spin2 = (x/count) * Math.PI * 2.2;
			offsetvec.setd(
				spin,
				spin2,
				spin,
				spin2
				);
			for (n=0;n<8;n++) {
				offsets[n*4+0] = offsetvec.data[0];
				offsets[n*4+1] = offsetvec.data[1];
				offsets[n*4+2] = offsetvec.data[2];
				offsets[n*4+3] = offsetvec.data[3];
			}

			meshBuilder.addMeshData(meshData, transform);
		}
		var meshDatas = meshBuilder.build();

		var material = Material.createMaterial(superLit, 'test');
		for (var key in meshDatas) {
			var entity = goo.world.createEntity();
			var meshDataComponent = new MeshDataComponent(meshDatas[key]);
			meshDataComponent.autoCompute = false;
			entity.setComponent(meshDataComponent);
			var meshRendererComponent = new MeshRendererComponent();
			meshRendererComponent.cullMode = 'Never';
			meshRendererComponent.materials.push(material);
			entity.setComponent(meshRendererComponent);
			entity.transformComponent.transform.translation.setd(670, 330, 640);
			entity.addToWorld();
		}
	}

	var superLit = {
		attributes : {
			vertexPosition : MeshData.POSITION,
			realVertexPosition : MeshData.NORMAL,
			movementNormal : 'movementNormal',
			movementNormal2 : 'movementNormal2',
			offsets : 'offsets'
		},
		uniforms : {
			viewProjectionMatrix : Shader.VIEW_PROJECTION_MATRIX,
			worldMatrix : Shader.WORLD_MATRIX,
			lightPosition : Shader.LIGHT0,
			move : 50.0,
			time : Shader.TIME
		},
		vshader : [ //
		'attribute vec3 vertexPosition;', //
		'attribute vec3 realVertexPosition;', //
		'attribute vec3 movementNormal;', //
		'attribute vec3 movementNormal2;', //
		'attribute vec4 offsets;', //

		'uniform mat4 viewProjectionMatrix;',
		'uniform mat4 worldMatrix;',//
		'uniform vec3 lightPosition;', //

		'uniform float move;',
		'uniform float time;',

		'varying vec3 normal;',//
		'varying vec3 lightDir;',//
		'varying float lightDist;',//
		'varying float vertDist;',//

		'void main(void) {', //
		'	vec3 pos = vertexPosition + ',
		'				movementNormal * sin(mix(offsets.x, offsets.y, sin(time*0.5)*0.5+0.5) + time) * move * 1.1 + ',
		'				movementNormal2 * cos(mix(offsets.z, offsets.w, sin(time*0.5)*0.5+0.5) + time) * move * 1.1;',
		'	vertDist = pow(1.0 - min(length(pos)/320.0, 1.0), 3.0) * 6.0;',
		'	gl_Position = viewProjectionMatrix * worldMatrix * vec4(pos, 1.0);', //

		'	normal = realVertexPosition.xyz;', //
		'	lightDir = lightPosition - pos;', //
		'	float l = length(lightDir);', //
		'	lightDist = (1.0 - min(l*l / 97000.0, 1.0))*2.0;',
		'	lightDir = normalize(lightDir);', //
		'}'//
		].join('\n'),
		fshader : [//
		'precision mediump float;',//

		'varying vec3 normal;',//
		'varying vec3 lightDir;',//
		'varying float lightDist;',//
		'varying float vertDist;',//

		'void main(void)',//
		'{',//
		'	float power = dot(normalize(normal),lightDir)*0.5+0.5;',
		'	vec3 col = vec3(1.0,0.2,1.00) * power * lightDist;',
		'	vec3 col2 = vec3(1.0, 0.2, 1.0) * vertDist;',
		'	gl_FragColor = vec4(col2*1.0+col*1.0, 1.0);',//
		'}'//
		].join('\n')
	};

	init();
});