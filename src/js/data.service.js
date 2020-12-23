const YAML = require('yaml')
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

}

export { DataService };