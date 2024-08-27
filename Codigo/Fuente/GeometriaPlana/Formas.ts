import { Punto } from "./Punto.js";
import { Vector } from "./Vector.js";
import { Transformacion } from "./Transformacion.js";
import { Dibujante } from "../Renderizado/Dibujante.js";
import { Geometria } from "../Utiles/Geometria.js";
import { TipoFormas } from "./TipoFormas.js";
import { OpcionesForma } from "./OpcionesForma.js";
//POR INTEGRAR
// Para una forma personalizada, ya sea abierta o cerrada, agregar un método para calcular su radio o su centro
// Función de reflejar
// SUMAR FORMAS


//Agregar propiedad de vértices transformados, normales rotadas y apotema, para no estar calculándolo en cada momento,
//ademas de una propiedad que avise cuando haya que aplicar la transformación.

/**MÓDULO FORMA         
 * Instancias de formas geométricas.            
 * Permite cambiar su posición, rotar, escalar, crear formas básicas y personalizadas, y dibujarlas.            
 */
export class Forma{
    protected _vertices: Vector[] = [];
    protected _verticesTransformados: Vector[] = [];
    protected _transformacion: Transformacion = new Transformacion();
    protected transformar: boolean = true;
    radio: number = 0;
    lados: number = 0;
    colorTrazo: string = "";
    colorRelleno: string = "";
    /**Determina si la forma debe ser trazada.*/
    trazada: boolean = true;
    /**Determina si la forma debe ser rellenada.*/
    rellenada: boolean = true;
    tipo: TipoFormas = TipoFormas.poligono;

    protected constructor(){}

    /**Retorna el valor del radio con la transformación de escala aplicada.*/
    get radioTransformado(): number{
        let radioTransformado: number = this.radio*this._transformacion.escala;
        return radioTransformado;
    }

    /**Retorna una copia de la transformación de la forma.*/
    get transformacion(): Transformacion{
        return new Transformacion(this._transformacion.posicion.x, this._transformacion.posicion.y, this._transformacion.rotacion, this._transformacion.escala);
    }

    /**Retorna una copia del vector de la posición después de aplicar las transformaciones*/
    get posicion(): Vector{
        let posicion: Vector = Vector.clonar(this._transformacion.posicion);
        return posicion;
    }   
     
    /**Retorna el ángulo de rotación actual de la forma.*/
    get rotacion(): number{
        return this._transformacion.rotacion;
    }
    
    get escala(): number {
        return this._transformacion.escala;
    }

    /**Retorna el arreglo de vértices sin transformaciones.*/
    get vertices(): Vector[]{
        return Vector.clonarConjunto(this._vertices);
    }

    /**Retorna el arreglo de vértices después de aplicar las transformaciones de escala, rotación y desplazamiento..*/
    get verticesTransformados(): Vector[]{
        if(this.transformar){
            this.transformarVertices()
        }
        return Vector.clonarConjunto(this._verticesTransformados)
    }

    /**Retorna un conjunto de vectores normales de cada arista del polígono.        
     * El orden de las aristas es en senttipoo horario.       
    */
    get normales(): Vector[]{
        let normales: Vector[] = [];
        for(let i: number = 0; i < this.verticesTransformados.length; i++){
            if(i != this.verticesTransformados.length - 1){
                let normal: Vector = Vector.normal(this.verticesTransformados[i], this.verticesTransformados[i+1]);
                normales.push(normal)
            }
            else{
                let normal: Vector = Vector.normal(this.verticesTransformados[i], this.verticesTransformados[0]);
                normales.push(normal)
                }
            }
            return normales;
    }   

    /**Retorna la distancia entre el centro del polígono y el punto más cercano de sus aristas.*/
    get apotema(): number{
        if(this.tipo == TipoFormas.circunferencia){
            return this.radioTransformado;
        }
        return Math.cos(Math.PI / this.lados)*this.radio;
    }


    /**Reemplaza la transformación de la forma.*/
    set transformacion(transformacion: Transformacion){
        this.transformar = true;
        this._transformacion = transformacion;
    }

    /**Reemplaza el vector posición de la forma.*/
    set posicion(nuevaPosicion: Vector){
        this.transformar = true;
        this._transformacion.posicion = Vector.clonar(nuevaPosicion);
    }

    /**Modifica el valor de la rotación de la figura con respecto a su forma sin transformaciones.*/
    set rotacion(rotacion: number){
        this.transformar = true;
        this._transformacion.rotacion = rotacion;
    }    

    /**Reemplaza el valor de la rotación de la forma.*/
    set escala(nuevaEscala: number){
        this.transformar = true;
        this._transformacion.escala = nuevaEscala;
    }

    /**Reemplaza el conjunto de vértices base de la forma.*/
    set vertices(vertices: Vector[]){
        this._vertices = Vector.clonarConjunto(vertices);
    }

    /**Inicia los vértices de la forma creada.*/
    private crearVertices(): Vector[]{
        if(this.lados == 0){
            return [];
        }
        let theta = Geometria.DOS_PI / this.lados;
        let offset = theta * 0.5;
        let nVertices = [];
        for (let i: number = 0; i < this.lados; i ++) {
            let angulo = offset + (i * theta);
            let xx = Math.cos(angulo) * this.radio;
            let yy = Math.sin(angulo) * this.radio;
            let vertice: Vector = Vector.crear(xx, yy);
            nVertices.push(vertice);
        }
        return nVertices;
    }

    //Agregar control de errores para índices mayores al número de vértices
    public moverVertice(indice: number, punto: Punto){
        this._vertices[indice] = Vector.crear(punto.x, punto.y);
    }

    /**Retorna una forma de tipo polígono. El radio es el valor entre el centro y cualquiera de sus vértices.*/
    static poligono(x: number, y: number, lados: number, radio: number, opciones?: OpcionesForma){
        let nuevoPoligono = new Forma();
        nuevoPoligono.lados = lados;
        nuevoPoligono.radio = radio;
        nuevoPoligono.vertices = nuevoPoligono.crearVertices();
        nuevoPoligono.tipo = TipoFormas.poligono;
        if(opciones){
            nuevoPoligono.aplicarOpciones(opciones)
        }
        nuevoPoligono.iniciarTransformacion(x, y)
        return nuevoPoligono;
    }

    /**Retorna una forma de tipo circunferencia. */
    static circunferencia(x: number, y: number, radio: number, opciones?: OpcionesForma){
        let nuevaCircunferencia = new Forma();
        nuevaCircunferencia.radio = radio;
        let lados = 10 + Math.trunc(radio / 10); 
        if(lados % 2 == 1){
            lados++
        }
        if(lados > 30){
            lados = 30;
        }
        nuevaCircunferencia.lados = lados;
        nuevaCircunferencia.vertices = nuevaCircunferencia.crearVertices();
        nuevaCircunferencia.tipo = TipoFormas.circunferencia;
        if(opciones){
            nuevaCircunferencia.aplicarOpciones(opciones)
        }
        nuevaCircunferencia.iniciarTransformacion(x, y)
        return nuevaCircunferencia;
    }

    /**Retorna una forma de tipo rectángulo. */
    static rectangulo(x: number, y: number, base: number, altura: number, opciones?: OpcionesForma){
        let rectangulo = new Forma();
        rectangulo.lados = 4;
        rectangulo.radio = Geometria.hipotenusa(base * 0.5, altura * 0.5);
        let ver1: Vector = Vector.crear(base/2, altura/2);
        let ver2: Vector = Vector.crear(-base/2, altura/2);
        let ver3: Vector = Vector.crear(-base/2, -altura/2);
        let ver4: Vector = Vector.crear(base/2, -altura/2);
        let rectVertices = [ver1, ver2, ver3, ver4];
        rectangulo.vertices = rectVertices;
        rectangulo.tipo = TipoFormas.poligono;
        if(opciones){
            rectangulo.aplicarOpciones(opciones)
        }
        rectangulo.iniciarTransformacion(x, y);
        return rectangulo;
    }


    /**Crea una recta centrada en el origen y con la posición ingresada almacenada en su registro de transformación.*/
    static recta(puntoUno: Punto, puntoDos: Punto, opciones?: OpcionesForma){
        let linea: Forma = new Forma();
        linea.lados = 1;
        linea.radio = Geometria.distanciaEntrePuntos(puntoUno, puntoDos) / 2;
        let centro = Vector.crear(puntoUno.x / 2 + puntoDos.x / 2, puntoUno.y / 2 + puntoDos.y / 2);
        let vertices: Vector[] = [Vector.crear(puntoUno.x - centro.x, puntoUno.y - centro.y), Vector.crear(puntoDos.x - centro.x, puntoDos.y - centro.y)];        
        linea.vertices = vertices;
        linea.tipo = TipoFormas.linea;
        if(opciones){
            linea.aplicarOpciones(opciones)
        }
        linea.iniciarTransformacion(centro.x, centro.y);
        return linea;
    }


    /**
     * Crea un conjunto de rectas a partir de un grupo de vértices.
     * Calcula el centro de los vértices, centra la forma en el origen y almacena
     * el centro en el registro de transformación.
     */
    static trazo(vertices: Vector[], opciones?: OpcionesForma): Forma{
        let centro: Vector = Vector.crear(0, 0)
        let trazo: Forma = new Forma();
        let verticesTrazo: Vector[] = []
        trazo.lados = vertices.length - 1;
        for(let vertice of vertices){
            centro = Vector.suma(centro, Vector.escalar(vertice, 1/vertices.length))
        }
        for(let vertice of vertices){
            verticesTrazo.push(Vector.resta(vertice, centro));
        }
        trazo.vertices = verticesTrazo;
        trazo.tipo = TipoFormas.linea;
        if(opciones){
            trazo.aplicarOpciones(opciones)
        }
        trazo.iniciarTransformacion(centro.x, centro.y);
        return trazo;
    }

    /**
     * Crea un polígono a partir de un grupo de vértices.
     * Calcula el centro de los vértices, centra la forma en el origen y almacena
     * el centro en el registro de transformación.
     */
    static poligonoSegunVertices(vertices: Vector[], opciones?: OpcionesForma): Forma{
        let centro: Vector = Vector.crear(0, 0)
        let poligono: Forma = new Forma();
        let verticesPoligono: Vector[] = []
        poligono.lados = vertices.length - 1;
        for(let vertice of vertices){
            centro = Vector.suma(centro, Vector.escalar(vertice, 1/vertices.length))
        }
        for(let vertice of vertices){
            verticesPoligono.push(Vector.resta(vertice, centro));
        }
        poligono.vertices = verticesPoligono;
        poligono.tipo = TipoFormas.poligono;
        if(opciones){
            poligono.aplicarOpciones(opciones)
        }
        poligono.iniciarTransformacion(centro.x, centro.y);
        return poligono;
    }

    /**Crea una transformación nueva para formas nuevas, con la posición ingresada.*/
    iniciarTransformacion(x: number, y: number): void{
        this._transformacion.posicion = Vector.crear(x, y);
    }

    /**Aplicación de la opciones definidas al crear una forma nueva.*/
    protected aplicarOpciones(opciones: OpcionesForma): void{
        if(opciones.colorTrazo){
            this.colorTrazo = opciones.colorTrazo;
        }
        if(opciones.colorRelleno){
            this.colorRelleno = opciones.colorRelleno;
        }
        if(opciones.trazada != undefined){
            this.trazada = opciones.trazada;
        }
        if(opciones.rellenada != undefined){
            this.rellenada = opciones.rellenada;
        }
        if(opciones.escala){
            this.escala = opciones.escala;
        }
        if(opciones.rotacion){
            this.rotacion = opciones.rotacion
        }
    }

    /**Actualiza el conjunto de vectores transformados.*/
    protected transformarVertices(): void{
        this._verticesTransformados = this._transformacion.transformarConjuntoVectores(this._vertices);
        this.transformar = false;
    }
    
    /**Suma el ángulo ingresado al ángulo de rotación de la figura.*/
    public rotar(angulo: number): void{
        this._transformacion.rotacion += angulo;
        this.transformar = true;
    }   

    /**Suma el vector ingresado al vector de posición de la figura.*/
    public desplazar(vector: Vector){
        this._transformacion.posicion = Vector.suma(this._transformacion.posicion, vector);
    }

    /**Rota la forma alrededor del punto (0, 0)*/
    public rotarSegunOrigen(angulo: number){
        this._transformacion.posicion = Vector.rotar(this._transformacion.posicion, angulo);
    }

    /**rota la forma alrededor del punto ingresado.*/
    public rotarSegunPunto(punto: Punto, angulo: number): void{
        let vectorAcomodador: Vector = Vector.crear(punto.x, punto.y);
        this._transformacion.posicion = Vector.resta(this._transformacion.posicion, vectorAcomodador);
        this.rotarSegunOrigen(angulo);
        this._transformacion.posicion = Vector.suma(this._transformacion.posicion, vectorAcomodador);
    }

    /**Traza el contorno de la forma. Usa una instancia de la clase Dibujante o Renderizado.*/
    public trazar(dibujante: Dibujante): void{
        dibujante.trazar(this);
    }

    /**Rellena el interior de la forma. Usa una instancia de la clase Dibujante o Renderizado.*/
    public rellenar(dibujante: Dibujante): void{
        dibujante.rellenar(this);
    }
}
    
    
