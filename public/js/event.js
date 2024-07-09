app = new Vue({
    el: '#app',
    data: {
        runs: [],
        selectedRun: null,
        correctionMode: false,
        log: []
    },
    computed: {
        runnersSorted: function() {
            runners = this.selectedRun.runners
            runners.sort(function(a, b) { 
                return a.number - b.number;
            });
            console.log(runners)
            return runners
        }
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
        addLog: function(number) {
            this.log.push({text: "Runde hinzugefügt.", id: number})
            if (this.log.length > 3) {
                this.log.shift()
            }
        },
        addRoundGetID: function() {
            var number = document.getElementById('id').value
            putAPI("/api/admin/round", {number: number}).then((data) => {
                this.addLog(number)
                console.log(data)
                document.getElementById('id').value = "",
                this.update()
            })
        },
        addRound: function(number) {
            putAPI("/api/admin/round", {number: number}).then((data) => {
                this.addLog(number)
                console.log(data)
                this.update()
            })
        },
        removeRound: function(number) {
            deleteAPI("/api/admin/round", {number: number}).then((data) => {
                console.log(data)
                this.correctionMode = false
                this.update()
            })
        },
        revert: function(index) {
            entry = this.log[index]
            console.log(index, entry)
            this.removeRound(entry.id)
            this.log.splice(index, 1)
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
        }
    },
    mounted: function() {
        this.update()

        vue = this
        document.getElementById("id").addEventListener("keyup", function(event) {
            if (event.key === "Enter" || event.keyCode === 13) {
                vue.addRoundGetID()
            }
        });
    }
});
