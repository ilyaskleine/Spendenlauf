app = new Vue({
    el: '#app',
    data: {
        jahrgaenge: [],
        selectedJahrgang: null,
        selectedClass: null,
        output: null
    },
    methods: {
        update: function() {
            vue = this;
            document.getElementById('name').value = "",
            document.getElementById('per_round').value = "",
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
            vue = this;
            input = {
                name: document.getElementById('name').value,
                per_round: document.getElementById('per_round').value,
                jahrgang_id: this.selectedJahrgang.id,
		class_id: this.selectedClass.id
            }
            console.log(input)
            postAPI("/api/admin/runner", input).then((data) => {
                console.log(data)
                if (data.success == true) this.update();
                vue.output = data.output;
                setTimeout(function () {
                    if (vue.output == data.output) {
                        vue.output = null;
                    }
                }, 3000);
            })
        },
        deleteRunner: function(number) {
            console.log(number)
            deleteAPI("/api/admin/runner", {number: number}).then((data) => {
                console.log(data)
                this.update()
            })
        },
        formatEuro: function(value) {
            if (value) {
                return value.toFixed(2).replaceAll('.', ',')
            } else {
                return "0,00"
            }
        }
    },
    mounted: function() {
        this.update()

        document.getElementById("name").addEventListener("keyup", function(event) {
            if (event.key === "Enter" || event.keyCode === 13) {
                document.getElementById('per_round').focus()
            }
        });
        
        vue = this
        document.getElementById('per_round').addEventListener("keyup", function(event) {
            if (event.key === "Enter" || event.keyCode === 13) {
                vue.create()
            }
        });
    }
});
