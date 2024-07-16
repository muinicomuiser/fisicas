import { Matematica } from "./Matematica.js";
import { Matriz } from "./Matrices.js";
import { Punto } from "./Punto.js";
//POR INTEGRAR
//  Para una forma personalizada, ya sea abierta o cerrada, agragar un método para calcular su radio o su centro
export class Forma {
    constructor(posicionX, posicionY, lados, radio, vertices) {
        this._posicion = Punto.crear(posicionX, posicionY);
        this._lados = lados;
        this._radio = radio;
        if (vertices) {
            this._vertices = vertices;
        }
        else {
            this.crearVertices();
        }
    }
    get id() {
        return this._id;
    }
    get posicion() {
        let punto = Punto.crear(this._posicion.x, this._posicion.y);
        return punto;
    }
    get lados() {
        return this._lados;
    }
    get radio() {
        return this._radio;
    }
    get vertices() {
        let copiaVertices = [];
        for (let vertice of this._vertices) {
            let punto = Punto.clonar(vertice);
            ;
            copiaVertices.push(punto);
        }
        return copiaVertices;
    }
    set id(nuevaId) {
        this._id = nuevaId;
    }
    set posicion(nuevaPosicion) {
        this._posicion = nuevaPosicion;
    }
    set lados(numeroLados) {
        this._lados = numeroLados;
    }
    set radio(nuevoRadio) {
        this._radio = nuevoRadio;
    }
    set vertices(vertices) {
        this._vertices = vertices;
    }
    crearVertices() {
        let theta = Matematica.DOS_PI / this._lados;
        let offset = theta * 0.5;
        let nVertices = [];
        for (let i = 0; i < this._lados; i += 1) {
            let angulo = offset + (i * theta);
            let xx = Math.cos(angulo) * this._radio + this._posicion.x;
            let yy = Math.sin(angulo) * this._radio + this._posicion.y;
            let vertice = Punto.crear(xx, yy);
            nVertices.push(vertice);
        }
        this._vertices = nVertices;
    }
    //Agregar control de errores para índices mayores al número de vértices
    moverVertice(indice, punto) {
        this._vertices[indice].x = punto.x;
        this._vertices[indice].y = punto.y;
    }
    static poligono(x, y, lados, radio) {
        let nuevoPoligono = new Forma(x, y, lados, radio);
        nuevoPoligono.id = "poligono";
        return nuevoPoligono;
    }
    static circunferencia(x, y, radio) {
        let lados = 10 + Matematica.truncar(radio / 10, 0);
        if (lados % 2 == 1) {
            lados++;
        }
        if (lados > 30) {
            lados = 30;
        }
        let nuevaCircunferencia = new Forma(x, y, lados, radio);
        nuevaCircunferencia.id = "circunferencia";
        return nuevaCircunferencia;
    }
    static rectangulo(x, y, base, altura) {
        let rectangulo = new Forma(x, y, 4, Matematica.hipotenusa(base * 0.5, altura * 0.5));
        rectangulo.id = "poligono";
        let ver1 = Punto.crear(Matematica.sumaSegura(base / 2, x), Matematica.sumaSegura(altura / 2, y));
        let ver2 = Punto.crear(Matematica.sumaSegura(-base / 2, x), Matematica.sumaSegura(altura / 2, y));
        let ver3 = Punto.crear(Matematica.sumaSegura(-base / 2, x), Matematica.sumaSegura(-altura / 2, y));
        let ver4 = Punto.crear(Matematica.sumaSegura(base / 2, x), Matematica.sumaSegura(-altura / 2, y));
        let rectVertices = [ver1, ver2, ver3, ver4];
        rectangulo.vertices = rectVertices;
        return rectangulo;
    }
    static recta(puntoUno, puntoDos) {
        let centro = Punto.crear(puntoUno.x / 2 + puntoDos.x / 2, puntoUno.y / 2 + puntoDos.y / 2);
        let vertices = [puntoUno, puntoDos];
        let linea = new Forma(centro.x, centro.y, 2, 1);
        linea.vertices = vertices;
        linea.id = "linea";
        return linea;
    }
    static trazo(vertices) {
        let centro = Punto.origen();
        ;
        for (let punto of vertices) {
            centro.x += punto.x / vertices.length;
            centro.y += punto.y / vertices.length;
        }
        let trazo = new Forma(centro.x, centro.y, vertices.length - 1, undefined, vertices);
        trazo.id = "linea";
        return trazo;
    }
    //Mueve la forma ubicando el centro en el punto ingresado
    ubicar(punto) {
        let dx = this._posicion.x - punto.x;
        let dy = this._posicion.y - punto.y;
        for (let vertice of this._vertices) {
            vertice.x -= dx;
            vertice.y -= dy;
        }
        this._posicion.x = punto.x;
        this._posicion.y = punto.y;
    }
    rotarSegunOrigen(angulo) {
        for (let vertice of this._vertices) {
            vertice.rotar(-angulo);
        }
        this._posicion = Matriz.rotarPunto2D(this._posicion, -angulo);
    }
    rotarSegunCentro(angulo) {
        let centro = Punto.clonar(this._posicion);
        this.ubicar(Punto.origen());
        this.rotarSegunOrigen(angulo);
        this.ubicar(centro);
    }
    rotarSegunPunto(punto, angulo) {
        let dx = this._posicion.x - punto.x;
        let dy = this._posicion.y - punto.y;
        let centroRotacion = Punto.crear(dx, dy);
        this.ubicar(centroRotacion);
        this.rotarSegunOrigen(angulo);
        centroRotacion = Punto.crear(this._posicion.x + punto.x, this._posicion.y + punto.y);
        this.ubicar(centroRotacion);
    }
}
