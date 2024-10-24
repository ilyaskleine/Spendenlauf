// Define font files
var fonts = {
    Roboto: {
      normal: 'fonts/Roboto-Regular.ttf',
      bold: 'fonts/Roboto-Medium.ttf',
      italics: 'fonts/Roboto-Italic.ttf',
      bolditalics: 'fonts/Roboto-MediumItalic.ttf'
    }
  };
  
  var PdfPrinter = require('pdfmake');
  var printer = new PdfPrinter(fonts);
  var fs = require('fs');
const { format } = require('path');

function formatEuro(value) {
    if (value) {
        return value.toFixed(2).replaceAll('.', ',')
    } else {
        return "0,00"
    }
}

  function generateResultsPDF(runners) {
    var content = []

    var counter = 0;
    for (var runner of runners) {
	if (runner.rounds > 0) {
	        counter++;
		var roundText = runner.festbetrag ? "Festbetrag:  " : "Betrag pro Runde:  "
        	var firstName = runner.name.split(" ")[0]
	        var perRound = formatEuro(runner.per_round)
        	var total = formatEuro(runner.amount_raised)
	        content.push({text: 'Ergebnisse des Spendenlaufs', style: 'subheader'},
        	"Hallo " + firstName + ",", "danke für deine Teilnahme am diesjährgen Spendenlauf! Nachdem du nun fleißig deine Runden gelaufen bist, ist unten deine Anzahl an Runden und dein Spendenbetrag aufgelistet.\n\n",
	        {
        	    alignment: 'justify',
	            columns: [
        	        {
                	    image: 'public/img/smv.png',
                    	width: 80
	                },
	                {
        	            text: [
				{text: 'ID:  ', bold: true},
				runner.number + '\n',
                	        {text: 'Klasse:  ', bold: true},
                        	runner.class + '\n',
	                        {text: 'Name:  ', bold: true},
        	                runner.name + '\n\n',
                	        {text: 'Runden:  ', bold: true},
                        	runner.rounds + '\n',
	                        {text: roundText, bold: true},
        	                perRound + ' €\n',
	                        {text: 'SPENDENBETRAG:  ', bold: true},
        	                total + ' €',
                	    ]
	                }
        	    ]
	        },
        	"\nBitte bring den Spendenbetrag in einer der dafür vorgesehen Pausen zum SMV-Stand.",
	        "\nEs dankt, deine SMV!")
        	if (counter >= 3) {
	            content.push({ text: '', fontSize: 1, pageBreak: 'after', margin: [0, 0, 0, 0] })
        	    counter = 0
        	}   
	} 
    }


    var docDefinition = {
        content: content,
        styles: {
            header: {
                fontSize: 18,
                bold: true
            },
            bigger: {
                fontSize: 15,
                italics: true
            },
            subheader: {
                fontSize: 16,
                bold: true,
                margin: [0, 15, 0, 5]
            }
        },
        defaultStyle: {
            columnGap: 20
        }
        
    }
      
      var options = {
        // ...
      }
      
      var pdfDoc = printer.createPdfKitDocument(docDefinition, options);
      var filename = runners[0].class + '_spendenlauf.pdf';
      pdfDoc.pipe(fs.createWriteStream('admin/pdf/' + filename));
      pdfDoc.end();
      return filename;
  }

function generateRunnerDataPDF(runners) {
    var content = [{text: 'Läuferdaten', style: 'header'}]
    var rows = [[{text: 'Bez.', style: 'tableHeader'}, {text: 'Nr.', style: 'tableHeader'}, {text: 'Klasse', style: 'tableHeader'}, {text: 'Läufer', style: 'tableHeader'}, {text: 'Rundenbetrag', style: 'tableHeader'}, {text: 'Runden', style: 'tableHeader'}, {text: 'Gesammt (berechnet)', style: 'tableHeader'}]]

    for (var runner of runners) {
	var hasPaidString = (runner.payed ? 'X' : ' ');
        rows.push([hasPaidString, runner.number, runner.class, runner.name, runner.per_round + ' €', runner.rounds, runner.amount_raised + ' €'])
    }

    content.push({table: {
        body: rows
    }})


    var docDefinition = {
        content: content,
        styles: {
            header: {
                fontSize: 18,
                bold: true
            },
            tableHeader: {
                bold: true,
                fontSize: 13,
                color: 'black'
            }
        },
        defaultStyle: {
            columnGap: 20
        }
    
    }
      
    var options = {
        // ...
    }
      
    var pdfDoc = printer.createPdfKitDocument(docDefinition, options);
    var filename = 'runner_data.pdf';
    pdfDoc.pipe(fs.createWriteStream('admin/pdf/' + filename));
    pdfDoc.end();
    return filename;
}

module.exports =  {
    generateResultsPDF: generateResultsPDF,
    generateRunnerDataPDF: generateRunnerDataPDF
}
  
