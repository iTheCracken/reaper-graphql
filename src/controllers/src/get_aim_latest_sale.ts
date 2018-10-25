
import { Tsuc } from "../TSTypes";
import { ITotalVenta } from "../TSInterfaces";
import newQuery from "../../SQL/dinamicConn";
import previousDB from "./get_select_db_of_closing";
import moment from "moment";

/**
 * 
 * @param suc especificar sucursal
 * @param i_d_year incrementar o decrementar años por defecto sera 0 ¡opcional!
 * @param database base de datos ¡opcional!
 */

export default async function getAimLatestSale(suc: Tsuc, i_d_year = 0, database?: string): Promise<number> {
	const _SQLQUERY: string = `
		SELECT
			((SUM(VentaValorNeta)/6.8) + SUM(VentaValorNeta)) Total FROM dbo.QVDEMovAlmacen
		WHERE TipoDocumento = 'V' AND Estatus = 'E'	/* add search conditions here */
		AND CONVERT(DATE, Fecha) = CAST(DATEADD(YEAR,${i_d_year}, GETDATE()) AS DATE)
	`;

    if( i_d_year === 0) {
        const { neW } = await newQuery("remote",suc, database);
        const _result: [ITotalVenta] = await neW.rawQuery(_SQLQUERY);
        return _result[0].Total;
    } else if ( suc === "jl" && moment().year() - 1  === 2017 ) {
        const { neW } = await newQuery("remote", suc, "JALTIPAN2");
        const _result: [ITotalVenta] = await neW.rawQuery(_SQLQUERY);
        return _result[0].Total;
    } else {
		const namePreviousDB = await previousDB("201808","remote", suc);
        const { neW	} = await newQuery("remote", suc,namePreviousDB[0].name);
        const _result: [ITotalVenta] = await neW.rawQuery(_SQLQUERY);
        return	_result[0].Total;
    }
}
 
