
import moment from "moment";
import newQuery from "../SQL/dinamicConn";

interface ISuc {
    suc: "vc"|"zr"|"ou"|"jl";
}
type Tsuc = "vc"|"zr"|"ou"|"jl";
type Ttipo = "local" | "remote";

const stadistics = (suc: Tsuc) => {
    // TODO
};
/**
 *
 * @param tipo
 * @param suc
 * @param database
 */
const getVentaSubfamilia = async (tipo: Ttipo, suc: Tsuc, database: string, tienda?: number , year?: number ) => {
    const { _Tienda, neW } = await newQuery(tipo, suc, database);
    const _SQLQUERY: string = `
        SELECT
          xMA.Almacen
          ,xMA.Tienda
          ,xMA.DescripcionAlmacen
          ,xMA.DescripcionTienda
          ,zA.Subfamilia
          ,ySF.Descripcion
          ,SUM(xMA.VentaValorNeta) VentaValorNeta
          ,COUNT(xMA.Articulo) NumVentas
        FROM QxDeMovAlmacen AS xMA
        LEFT JOIN Articulos AS zA ON zA.Articulo = xMA.Articulo
        LEFT JOIN Subfamilias AS ySF ON ySF.Subfamilia = zA.Subfamilia
        WHERE xMA.Tienda = ${tienda ? tienda : _Tienda} AND TipoDocumento = 'V' AND Estatus = 'E'
          AND CONVERT(DATE,xMA.Fecha) = CAST(DATEADD(YEAR, ${ year ? year : 0 } ,GETDATE()) AS DATE)
        GROUP BY zA.Subfamilia, ySF.Descripcion, xMA.Almacen
          , xMA.Tienda, xMA.DescripcionAlmacen, xMA.DescripcionTienda
        ORDER BY NumVentas DESC
      `;
    return await neW.rawQuery(_SQLQUERY);
};
interface ILastDB {
    name: string;
}
/**
 *
 * @param date
 * @param tipo
 * @param suc
 */
const getDbLastDate = async (date: string, tipo: Ttipo, suc: Tsuc): Promise<ILastDB[]> => {
    try {
        const { neW } = await newQuery(tipo, suc);
        const lastDbName: string = `${neW.database}_${date}`;
        const _SQLQUERY: string = `SELECT name FROM sys.databases AS A WHERE A.name = N'${lastDbName}'`;
        const lastDb: ILastDB[] = await neW.rawQuery(_SQLQUERY);
        return lastDb;
    } catch (e) {
        throw new Error(`getDbDate:\t \n ${e}`);
    }
};
/**
 *
 * @param { object } obj
 * @param { suc: string } args
 * @param context
 * @param info
 */

async function previousDetailVenta(obj: any, { suc }: ISuc, context: any, info: any) {
    if ( suc === "vc" || "zr" || "ou" || "jl" || "bo" ) {
        if ( moment().month() === moment("20171001").month() && suc === "jl" && moment("20171001").year() === moment().year() - 1 ) {
            console.log(moment().year() - 1);
            try {
                // getVentaSubfamilia(type,sucursal,db,year)
                return await getVentaSubfamilia("remote",suc,"JALTIPAN2", 1, -1);
            }catch(e) {
                throw new Error(`${e}`);
            }
        } else {
            try {
                const lastDB = await getDbLastDate("201808", "remote", suc);
                const nameLastDb: ILastDB = lastDB[0];
                return await getVentaSubfamilia("remote", suc , nameLastDb.name, undefined, -1);
            } catch (e) {
                throw new Error(`analisisArticulos: \n ${e}`);
            }
        }
    } else {
        throw new Error("Solo se aceptan valores como los sig: vc | zr | ou | jl | bo ");
    }
}

async function latestDetailVenta( obj: any, { suc }:ISuc, context: any, info: any ) {
    if ( suc === "zr" || "vc" || "ou" || "jl" ) {
        try {
            const latestDb = await getDbLastDate( "201808","remote", suc);
            const nameLatestDb: ILastDB  = latestDb[0];
            console.log(nameLatestDb);
            return await getVentaSubfamilia("remote", suc, nameLatestDb.name);
        }catch(e){
            throw new Error(`latestDetailVenta: \n ${e}`);
        }
    } else {
        throw new Error(`latestDetailVenta: \n`);
    }
}
    

async function getAllArticulos() {
    const _SQLQUERY: string = `
        SELECT Articulo
          ,Nombre
          ,Descripcion
          ,Relacion = '['+ CAST(CAST(FactorCompra AS INT) AS VARCHAR) + UnidadCompra + ' / '
            + CAST(CAST(FactorVenta AS INT) AS VARCHAR) + UnidadVenta +']'
        FROM Articulos
      `;
    try {
        const { neW } = await newQuery("remote", "bo");
        return await neW.rawQuery(_SQLQUERY);
    } catch (e) {
        throw new Error(`getAllArticulos:\n \t ${e}`);
    }
}

export {
    getAllArticulos,
    previousDetailVenta,
    latestDetailVenta,
};
