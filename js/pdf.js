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

  function makeRunnerPDF(runners) {
    var content = []

    for (var runner of runners) {
        var firstName = runner.name.split(" ")[0]
        var perRound = formatEuro(runner.per_round)
        var total = formatEuro(runner.amount_raised)
        content.push({text: 'Ergebnisse des Spendenlaufs', style: 'subheader'},
        "Hallo " + firstName + ",", "Danke für deine Teilnahme am diesjährgen Spendenlauf! Nachdem nun alle fleißig ihre Runden gelaufen sind, ist unten für dich aufgelistet, wie viele Runden du selbst gelaufen bist und was dein Spendenbetrag ist.\n\n",
        {
            alignment: 'justify',
            columns: [
                {
                    image: 'public/img/smv.png',
                    width: 80
                },
                {
                    text: [
                        {text: 'Klasse:  ', bold: true},
                        runner.class + '\n',
                        {text: 'Name:  ', bold: true},
                        runner.name + '\n\n',
                        {text: 'Runden gelaufen:  ', bold: true},
                        runner.rounds + '\n',
                        {text: 'Betrag pro Runde:  ', bold: true},
                        perRound + ' €\n',
                        {text: 'SPENDENBETRAG:  ', bold: true},
                        total + ' €',
                    ]
                }
            ]
        },
        "\nBitte bring den Spendenbetrag in einer der dafür vorgesehen Pausen zum SMV-Stand.",
        "\nEs dankt, deine SMV!")
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
                margin: [0, 10, 0, 5]
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

  module.exports =  {
    makeRunnerPDF: makeRunnerPDF
  }
  
