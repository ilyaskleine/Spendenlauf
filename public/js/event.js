app = new Vue({
    el: '#app',
    data: {
        jahrgaenge: [],
        selected: null
    },
    methods: {
        update: function() {
            vue = this;
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
        addRound: function(number) {
            putAPI("/api/admin/round", {number: number}).then((data) => {
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
