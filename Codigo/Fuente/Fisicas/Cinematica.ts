import { Cuerpo } from "./Cuerpo.js";
import { Matematica } from "../Utiles/Matematica.js";
import { Vector } from "../GeometriaPlana/Vector.js";
import { Punto } from "../GeometriaPlana/Punto.js";

//Momento lineal, movimiento acelerado, momento angular, energía cinética y potencial.

export class Cinematica{
    /**Retorna un vector velocidad de un cuerpo que colisiona con una superficie.*/
    static reboteSimple(cuerpo: Cuerpo, normal: Vector): Vector{
        let anguloNormal: number = Vector.angulo(normal);
        let vectorRebotado: Vector = Vector.clonar(cuerpo.velocidad);
        if(Vector.anguloVectores(vectorRebotado, normal) > Matematica.PI_MEDIO){
            vectorRebotado = Vector.invertir(vectorRebotado);
        }
        vectorRebotado = Vector.rotar(vectorRebotado, (anguloNormal - Vector.angulo(vectorRebotado))*2)
        return vectorRebotado;
    }
}