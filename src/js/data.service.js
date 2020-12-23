const YAML = require('yaml')
const cloneDeep = require('lodash.clonedeep');
const colors = require('colors');
const Table = require('cli-table3');

import { GAppDataService } from './gappdata.service.js';

var DEFAULT_DATA = `
config:
  
  # Tokens por usuario
  token_total: 9

  # Los tokens empleados para una reserva son devueltos al usuario después
  # de el número de días indicados desde el disfrute de la misma.
  token_release_period: 30

  # Coste de tokens para hacer una reserva...
  token_booking_cost:

    # Por número de días hasta la fecha de disfrute.
    # Si el número de días 'max' está especificado, no existe
    # límite en el número de días de anticipación para la realización
    # de la reserva siendo su coste el indicado cuando no haya otro valor
    # más apropiado.
    # Si para un número de días no se especifica un valor,
    # se usará el indicado para un número de días inferior más proximo
    # ó max ó 0 por esta prioridad.
    days:
      1: 0
      2: 1
      3: 2
      max: 3

    # Por duración de la reserva en minutos, siendo permitidas las aquí
    # indicadas.
    time:
      60: 0
      90: 0

  # Activando esta opción, no se permitirá un hueco entre dos reservas
  # inferior a la duracíon mínima permitida de las mismas. Se permitirá en
  # su lugar una duración ampliada para la posible segunda reserva inmediatamente
  # anterior o posterior a la primera al coste adicional indicado.
  booking_clamp: true
  booking_clamp_cost: 1
data:
  bookings: []
`

const TIMETABLE = {
    "00:00" : ["00:00"], "00:30" : ["00:30"], "01:00" : ["01:00"], "01:30" : ["01:30"],
    "02:00" : ["02:00"], "02:30" : ["02:30"], "03:00" : ["03:00"], "03:30" : ["03:30"],
    "04:00" : ["04:00"], "04:30" : ["04:30"], "05:00" : ["05:00"], "05:30" : ["05:30"],
    "06:00" : ["06:00"], "06:30" : ["06:30"], "07:00" : ["07:00"], "07:30" : ["07:30"],
    "08:00" : ["08:00"], "08:30" : ["08:30"], "09:00" : ["09:00"], "09:30" : ["09:30"],
    "10:00" : ["10:00"], "10:30" : ["10:30"], "11:00" : ["11:00"], "11:30" : ["11:30"],
    "12:00" : ["12:00"], "12:30" : ["12:30"], "13:00" : ["13:00"], "13:30" : ["13:30"],
    "14:00" : ["14:00"], "14:30" : ["14:30"], "15:00" : ["15:00"], "15:30" : ["15:30"],
    "16:00" : ["16:00"], "16:30" : ["16:30"], "17:00" : ["17:00"], "17:30" : ["17:30"],
    "18:00" : ["18:00"], "18:30" : ["18:30"], "19:00" : ["19:00"], "19:30" : ["19:30"],
    "20:00" : ["20:00"], "20:30" : ["20:30"], "21:00" : ["21:00"], "21:30" : ["21:30"],
    "22:00" : ["22:00"], "22:30" : ["22:30"], "23:00" : ["23:00"], "23:30" : ["23:30"]
};

function DataService() {
    this.driveService = new GAppDataService();
    this.data = null;
    
    this.getDefaultData = function() {
        return YAML.stringify(YAML.parse(DEFAULT_DATA));
    }

    this.getDataString = function() {
        return YAML.stringify(this.data);
    }

    this.getPeriod = function() {
        return this.data.config.token_release_period;
    }

    this.loadData = async function() {
        if (this.data == undefined) {
            var dataString = await this.driveService.loadData().then((data) => {
                if (data) {
                    return Promise.resolve(data);
                }
                var defaultData = window.dataService.getDefaultData();
                return this.driveService.saveData(defaultData).then((data) => {return defaultData;});
            }).then((data) => {return data});
            this.data = YAML.parse(dataString);
        }
   }

   this.getTimetable = function(date) {
        colors.enable();
        
        var timetable = cloneDeep(TIMETABLE);

        // set data for the date, example
        //colors.enable();
        var value = colors.white.bgBlack("B3D");
        //colors.disable();
        timetable["19:00"].push({rowSpan: 3, content: value, vAlign: 'center'});
        
        var table = new Table({style: {head: [], border: []}});
        Object.values(timetable).slice(20).forEach((row) => table.push(row))

        colors.disable();
        return table.toString();
   }

}

export { DataService };