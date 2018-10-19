import { ILastDB } from "../TSInterfaces";
import { Ttipo, Tsuc } from "../TSTypes";
import newQuery from "../../SQL/dinamicConn";

export default async function getDbNameforClosing (date: string, tipo: Ttipo, suc: Tsuc): Promise<ILastDB[]> {
	try {
		const { neW } = await newQuery(tipo, suc);
		const lastDbName: string = `${neW.database}_${date}`;
		const _SQLQUERY: string = `SELECT name FROM sys.databases AS A WHERE A.name = N'${lastDbName}'`;
		const lastDb: ILastDB[] = await neW.rawQuery(_SQLQUERY);

		return lastDb;
	} catch (e) {
		throw new Error(`get_select_db_for_name:\t \n ${e}`);
	}
};
