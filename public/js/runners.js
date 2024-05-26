app = new Vue({
    el: '#app',
    data: {
        jahrgaenge: [],
        selected: null
    },
    methods: {
        update: function() {
            vue = this;
            document.getElementById('number').value = "",
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
                if (!this.selected) {
                    this.selected = this.jahrgaenge[0];
                } else {
                    this.selected = this.jahrgaenge.find(jahrgang => jahrgang.id == this.selected.id);
                }
            })
            .catch(error => {
                console.error('Error:', error);
            });
        },
        create: function() {
            input = {
                number: document.getElementById('number').value,
                name: document.getElementById('name').value,
                per_round: document.getElementById('per_round').value,
                jahrgang: this.selected.id
            }
            console.log(input)
            postAPI("/api/admin/runner", input).then((data) => {
                console.log(data)
                this.update()
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
            return value.toFixed(2).replaceAll('.', ',')
        }
    },
    mounted: function() {
        this.update()
    }
});
