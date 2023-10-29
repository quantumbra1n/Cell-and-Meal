/*
Синий шар - клетка
Красный диск шара - поле зрения клетки
Зеленый куб - еда
Клетка двигается по платформе и ест еду
*/

// Поле зрения для клетки
class FieldOfView {
	constructor(scene, cellPosition) {

		// ФОРМА, МАТЕРИАЛ, ПОЗИЦИЯ И ПОВОРОТ ОБЪЕКТА НА СЦЕНЕ
		this.scene = scene;
		this.disc = new BABYLON.MeshBuilder.CreateDisc("disc", {radius: 1}, this.scene);
		this.discMaterial = new BABYLON.StandardMaterial("material", this.scene);
		this.discMaterial.emissiveColor = new BABYLON.Color3(1, 0, 0);
		this.disc.material = this.discMaterial;
		this.disc.rotation = new BABYLON.Vector3(Math.PI / 2, 0, 0); // Повернуть параллельно платформе относительно alpha
		this.disc.position = cellPosition;
		this.disc.visibility = 0.5;
	}
	// Изменение позиции поля зрения
	updatePosition(changedX, changedZ) {
		this.disc.position.x = changedX;
		this.disc.position.z = changedZ;
	}
}

// Клетка
class Cell {
	constructor(scene) {

		// ФОРМА И МАТЕРИАЛ ОБЪЕКТА НА СЦЕНЕ
		this.scene = scene;
		this.diameterValue = 1;
		this.sphere = new BABYLON.MeshBuilder.CreateSphere("sphere", {diameter: this.diameterValue, updatable: true}, this.scene); // Создание меша сферы
		this.sphereMaterial = new BABYLON.StandardMaterial("material", this.scene); // Создание материала для меша сферы
		this.sphereMaterial.emissiveColor = new BABYLON.Color3(0.569, 0, 1); // Цвет материала
		this.sphere.material = this.sphereMaterial; // Присвоение материала мешу сферы
		this.sphere.position = new BABYLON.Vector3(0, 0.5, 0); // Начальная позиция клетки

		// ФИЗИЧЕСКИЕ ПАРАМЕТРЫ ОБЪЕКТА
		this.sphere.physicsImpostor = new BABYLON.PhysicsImpostor( // Физические параметры сферы
			this.sphere,
			BABYLON.PhysicsImpostor.SphereImpostor,
			{
				mass: 1,
				//restitution: 4, // отталкивание от другого объекта
				//friction: 0 // трение, сцепленность к платформе, кручение сферы во время движения
			},
			this.scene
		);

		// ПРИВЯЗКА ПОЛЯ ЗРЕНИЯ КО КЛЕТКЕ
		this.FOV = new FieldOfView(this.scene, this.sphere.position);
	}
	die() { // Уничтожить сферу на сцене
		this.sphere.dispose();
	}
	scal(){ // отстой
		this.sphere.scaling = new BABYLON.Vector3(3, 3, 3);
		this.sphere.position.y = 3;
	}
	followMe() { // Для перемещения FOV вместе с клеткой
		let time = setInterval(() => {
			this.FOV.updatePosition(this.sphere.position.x, this.sphere.position.z);
			//console.log(this.sphere.position.x + " " + this.sphere.position.z);
			//console.log(this.sphere.physicsImpostor.getLinearVelocity().z);

			if (!this.sphere.physicsImpostor.getLinearVelocity().z && 
				!this.sphere.physicsImpostor.getLinearVelocity().x){
				clearInterval(time);
			}
		});
	}
}

// Еда
class Meal {
	constructor(scene) {

		// ФОРМА И МАТЕРИАЛ ОБЪЕКТА НА СЦЕНЕ
		this.scene = scene;
		this.box = new BABYLON.MeshBuilder.CreateBox(this.objID, {size: 0.5}, this.scene);
		this.boxMaterial = new BABYLON.StandardMaterial("material", this.scene);
		this.boxMaterial.emissiveColor = new BABYLON.Color3(0.118, 0.871, 0.02);
		this.box.material = this.boxMaterial;

		// ФИЗИЧЕСКИЕ ПАРАМЕТРЫ ОБЪЕКТА
		this.box.physicsImpostor = new BABYLON.PhysicsImpostor(
			this.box,
			BABYLON.PhysicsImpostor.BoxImpostor,
			{
				mass: 1,
			},
			this.scene
		);
		this.nutrient = new BABYLON.Vector3(0.1, 0.1, 0.1); // Питательное вещество для клетки
	}
	
	move() { // По хорошему был бы метод создания еды на рандомных координатах, в которых не 
		this.box.position = new BABYLON.Vector3(3, 0.5, 0);
	}
}

class Platform {
	constructor(scene) {

		// ФОРМА И МАТЕРИАЛ ОБЪЕКТА НА СЦЕНЕ
		this.scene = scene;
		this.ground = new BABYLON.MeshBuilder.CreateGround("ground", {width: 15, height: 15}, scene);
		this.groundMaterial = new BABYLON.StandardMaterial("material", scene);
		this.groundMaterial.emissiveColor = new BABYLON.Color3(0, 0.514, 1);
		this.ground.material = this.groundMaterial;

		// ФИЗИЧЕСКИЕ ПАРАМЕТРЫ ОБЪЕКТА
		this.ground.physicsImpostor = new BABYLON.PhysicsImpostor(
			this.ground,
			BABYLON.PhysicsImpostor.BoxImpostor,
			{
				mass: 0
			},
			this.scene
		);
		this.scene;
	}
}

class CameraMan {
	constructor(scene, canvas) {
		// Создание камеры
		this.camera = new BABYLON.ArcRotateCamera('camera', 0, 0, 10, new BABYLON.Vector3(0, 0, 0), scene);
		// Positions the camera overwriting alpha, beta, radius
		this.camera.setPosition(new BABYLON.Vector3(0, 5, 20));
		// This attaches the camera to the canvas
		this.camera.attachControl(this.canvas, true); // ГДЕ ОН ВЗЯЛ КАНВАС??
	}
}

class Scene {
	constructor() {
		// Выберем холст, на котором будет создана сцена
		this.canvas = window.document.querySelector('#renderCanvas');
		// Создание движка
		this.engine = new BABYLON.Engine(this.canvas);
		// Создание сцены и присоединение ее к движку
		this.scene = new BABYLON.Scene(this.engine);
		// Цвет сцены
		this.scene.clearColor = new BABYLON.Color3(0.388, 0.388, 0.388);
		// Активация физики в сцене
		this.scene.enablePhysics();
		// Массивы объектов на сцене
		this.cellArray = []; // Клетки
		this.mealArray = []; // Пищи
	}
	generate() { // Генерирует объекты на сцене
		let c = new Cell(this.scene); // Создаем объект "Клетка"
		let m = new Meal(this.scene);
		m.move();
		this.mealArray.push(m);
		this.cellArray.push(c);
		let g = new Platform(this.scene);
		let cam = new CameraMan(this.scene, this.canvas);
		
		/*
		for(var i in this.cellArray[0].sphere){
			console.log('this.cellArray[0].sphere[' + i + '] = ' + this.cellArray[0].sphere[i]);
		}
		*/
		
        // ОБРАБОТЧИКИ СОБЫТИЙ
		window.addEventListener("pointerdown", () => { // Придаем импульс для передвижения при нажатии ЛКМ
			//console.log("sphere " + c.sphere.position.x);
			//console.log("ground " + g.ground._minX);
			//c.increaseDiameter(0.1);
			//console.log(c.diameterValue);
			
			this.cellArray[0].sphere.physicsImpostor.applyImpulse(
				new BABYLON.Vector3(5, 0, 0), // приложить импульс к клетке по указанным координатам
				this.cellArray[0].sphere.getAbsolutePosition()
			);
			this.cellArray[0].followMe();
		});
		window.addEventListener("pointerup", () => { // Обнуляем линейную и угловую скорости при опускании ЛКМ
			this.cellArray[0].sphere.physicsImpostor.setLinearVelocity(new BABYLON.Vector3(0, 0, 0));
			this.cellArray[0].sphere.physicsImpostor.setAngularVelocity(new BABYLON.Vector3(0, 0, 0));
		});
		
		// Столкновение клетки с едой
		// (Учти, что возможно меш еды сохраняется на сцене, если не удалять объект еды через массив)
		this.cellArray[0].sphere.physicsImpostor.registerOnPhysicsCollide(
			this.mealArray[0].box.physicsImpostor,
			(cellCol, mealCol) => { // DetectCollision // Обработка столкновения клетки с едой, params type: PhysicsImpostor
				cellCol.object.scaling.addInPlaceFromFloats(0.1, 0.1, 0.1); // Масштабирование меша клетки
				cellCol.object.position.y = cellCol.object.scaling.y / 2; // Поднимаем клетку вверх
				cellCol.setScalingUpdated(); // Подтверждаем масштабирование

				// Уничтожаем еду
				for (let i = 0; i < this.mealArray.length; i++){
					if (this.mealArray[i].box.id == mealCol.object.id){
						this.scene.getMeshById(mealCol.object.id).dispose();
						this.mealArray.splice(i, 1);
					}
				}
				//console.log(cellCol.object.scaling);
				//console.log(mealCol.nutrient);
			}
		);
		
		// Постоянный анализ состояния объектов на сцене
		this.scene.registerBeforeRender(() => {
			// Обнаружение FOVом еды
			if (this.mealArray[0] && this.cellArray[0].FOV.disc.intersectsMesh(this.mealArray[0].box)){
				console.log("MEAL WAS DETECTED!");
			}

			// Не дать клетке упасть с плоскости
			// (Надо отрефакторить, возможно применить switch case)
			let time = setInterval(() => {
				if (this.cellArray[0].sphere.position.x+0.5 > g.ground._maxX){ // ||
					this.cellArray[0].sphere.position.x -= 0.005;
				}
				else if (this.cellArray[0].sphere.position.x-0.5 < g.ground._minX){ // ||
					this.cellArray[0].sphere.position.x += 0.005;
				}
				else if (this.cellArray[0].sphere.position.z+0.5 > g.ground._maxZ ){ // ||
					this.cellArray[0].sphere.position.z -= 0.005;
				}
				else if (this.cellArray[0].sphere.position.z-0.5 < g.ground._minZ){
					this.cellArray[0].sphere.position.z += 0.005;
				}
				else {
					clearInterval(time);
				}
			});
		});

		// Циклично прогружаем сцену
		this.engine.runRenderLoop(() => {
			this.scene.render();
		});
	}
}

// Создаем сцену и генерируем в ней объекты 
s = new Scene();
s.generate();