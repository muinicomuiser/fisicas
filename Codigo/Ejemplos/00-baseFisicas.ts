import { Composicion, Cuerpo, Entorno, Forma, Fuerza, Renderizado, Restriccion } from "../Fuente/mui.js";

const COMPO: Composicion = new Composicion('canvas')
COMPO.tamanoCanvas(500, 500)
const Render: Renderizado = COMPO.render;
Render.colorCanvas = 'black'

//CUERPOS
//Formas generadoras
const RADIOGENERADORA: number = 160;
const RADIOGENERADORADOS: number = 80;
const NUMEROCUERPOS: number = 100;
const FormaGeneradora: Forma = Forma.poligono(Render.centroCanvas.x, Render.centroCanvas.y, NUMEROCUERPOS * 0.5, RADIOGENERADORA)
const FormaGeneradoraDos: Forma = Forma.poligono(Render.centroCanvas.x, Render.centroCanvas.y, NUMEROCUERPOS * 0.5, RADIOGENERADORADOS)

//Cuerpos
const RADIOCUERPO: number = 6;
const RADIOCUERPODOS: number = 3;
const Circunferencias: Cuerpo[] = []

FormaGeneradora.verticesTransformados.forEach((vertice) => {
    let circunferencia: Cuerpo = Cuerpo.circunferencia(vertice.x, vertice.y, RADIOCUERPO)
    circunferencia.opcionesGraficas.colorRelleno = 'pink'
    circunferencia.opcionesGraficas.colorTrazo = 'darkblue'
    Circunferencias.push(circunferencia);
})

FormaGeneradoraDos.verticesTransformados.forEach((vertice) => {
    let circunferencia: Cuerpo = Cuerpo.circunferencia(vertice.x, vertice.y, RADIOCUERPODOS)
    circunferencia.opcionesGraficas.colorRelleno = 'pink'
    circunferencia.opcionesGraficas.colorTrazo = 'darkblue'
    Circunferencias.push(circunferencia);
})


//cuerpo atractor
const MagnitudAtraccion: number = 0.05;
const RADIOATRACTOR: number = 30
const Atractor: Cuerpo = Cuerpo.circunferencia(Render.centroCanvas.x, Render.centroCanvas.y, RADIOATRACTOR)
Atractor.opcionesGraficas.colorRelleno = 'orange';
Atractor.opcionesGraficas.colorTrazo = 'purple';
Atractor.fijo = false;


//Se integran todos los cuerpos a la composición
COMPO.agregarCuerpos(...Circunferencias, Atractor);


//Frontera del canvas
const Frontera: Entorno = Entorno.crearEntornoCanvas(Render.canvas);
console.log(Frontera.cuerpo)
Frontera.cuerpo.opcionesGraficas = { colorTrazo: 'white', grosorTrazo: 2 }


//Animación
function animar() {
    Render.limpiarCanvas()

    Circunferencias.forEach((circunferencia) => circunferencia.aceleracion = Fuerza.atraer(circunferencia, Atractor, MagnitudAtraccion))
    Frontera.colisionConBorde(...Circunferencias, Atractor);
    COMPO.actualizarMovimientoCuerpos()

    COMPO.cuerpos.forEach((cuerpo) => cuerpo.velocidad = Restriccion.limitarVelocidad(cuerpo, 10))

    Render.trazar(Frontera.cuerpo);
    COMPO.renderizarCuerpos();
    requestAnimationFrame(animar)
}
animar()