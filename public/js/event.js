app = new Vue({
    el: '#app',
    data: {
        runs: [],
        selectedRun: null,
        correctionMode: false
    },
    methods: {
        update: function() {
            vue = this;
            fetch('/api/admin/runs-runners')
            .then(response => {
                if (!response.ok) {
                throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                this.runs = data.runs;
                console.log(data, this.runs)
                if (!this.selectedRun) {
                    this.selectedRun = this.runs[0];
                } else {
                    this.selectedRun = this.runs.find(jahrgang => jahrgang.id == this.selectedRun.id);
                }
            })
            .catch(error => {
                console.error('Error:', error);
            });
        },
        addRound: function(number) {
            putAPI("/api/admin/round", {number: number}).then((data) => {
                this.addToLog("Runde für Läufer " + number + " hinzugefügt.")
                this.update()
            })
        },
        removeRound: function(number) {
            deleteAPI("/api/admin/round", {number: number}).then((data) => {
                this.addToLog("Runde für Läufer " + number + " entfernt.")
                this.correctionMode = false
                this.update()
            })
        },
        addOrRemove: function(number) {
            if (this.correctionMode) {
                this.removeRound(number)
            } else {
                this.addRound(number)
            }
        },
        rundenString: function(count) {
            return count == 1 ? " Runde" : " Runden"
        },
        formatEuro: function(value) {
            return value.toFixed(2).replaceAll('.', ',')
        },
        addToLog: function(text) {
            var now = new Date()
            const timestring = now.getHours() + ' : ' + now.getMinutes() + ' : ' + now.getSeconds()
            log = this.getLog()
            log[timestring] = text
            localStorage.log = JSON.stringify(log)
        },
        getLog: function() {
            return localStorage.log ? JSON.parse(localStorage.log) : {}
        }
    },
    mounted: function() {
        this.update()
    }
});
