app = new Vue({
    el: '#app',
    data: {
        jahrgaenge: [],
        runs: [],
        selectedJahrgang1: null,
        selectedJahrgang2: null,
    },
    methods: {
        update: function() {
            vue = this;
            document.getElementById('title').value = "",
            fetch('/api/admin/runs')
            .then(response => {
                if (!response.ok) {
                throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                this.runs = data.runs;
                console.log(this.runs)
            })
            .catch(error => {
                console.error('Error:', error);
            });
            fetch('/api/admin/jahrgaenge')
            .then(response => {
                if (!response.ok) {
                throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                this.jahrgaenge = data.results;
                console.log(this.jahrgaenge)
                if (!this.selectedJahrgang) {
                    this.selectedJahrgang = this.jahrgaenge[0];
                } else {
                    this.selectedJahrgang = this.jahrgaenge.find(jahrgang => jahrgang.id == this.selectedJahrgang.id);
                }
                if (!this.selectedClass) {
                    this.selectedClass = this.selectedJahrgang.classes[0];
                } else {
                    this.selectedClass = this.selectedJahrgang.classes.find(classObj => classObj.id == this.selectedClass.id);
                }
            })
            .catch(error => {
                console.error('Error:', error);
            });
        },
        create: function() {
            input = {
                title: document.getElementById('title').value,
                jahrgang_1: this.selectedJahrgang1.id,
                jahrgang_2: this.selectedJahrgang2.id
            }
            console.log(input)
            postAPI("/api/admin/run", input).then((data) => {
                console.log(data)
                if (data.success == true) this.update();
            })
        },
        deleteRun: function(number) {
            console.log(number)
            deleteAPI("/api/admin/runner", {number: number}).then((data) => {
                console.log(data)
                this.update()
            })
        },
    },
    mounted: function() {
        this.update()
    }
});
