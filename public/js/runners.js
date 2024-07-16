app = new Vue({
    el: '#app',
    data: {
        jahrgaenge: [],
        selectedJahrgang: null,
        selectedClass: null,
        output: null,
        fixed: false,
        downloadFilename: null,
        downloadClass: null,
        downloadLoading: false,
        deletionDisabled: false,
        payment: false,
        paymentError: null,
        paymentData: null
    },
    methods: {
        update: function() {
            vue = this;
            if (!this.payment) {
                document.getElementById('name').value = ""
                document.getElementById('per_round').value = ""
            }
            fetch('/api/admin/jahrgaenge')
            .then(response => {
                if (!response.ok) {
                throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                this.jahrgaenge = data.results;
                this.deletionDisabled = !!+data.deletionDisabled
                this.payment = !!+data.payment
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
		class_id: this.selectedClass.id,
                fixed: this.fixed
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
            if (this.deletionDisabled) {
                msg = "Löschen temporär gesperrt um versehendlichen Datenverlust zu verhindern."
                vue.output = msg
                setTimeout(function () {
                    if (vue.output == msg) {
                        vue.output = null;
                    }
                }, 10000);
                return
            }
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
        },
        generatePDF: function() {
            vue = this
            this.downloadLoading = true
            postAPI("/api/admin/pdf/runners", {class: this.selectedClass.id}).then((data) => {
                if (data.sucess == false) return;
                vue.downloadFilename = data.filename
                vue.downloadLoading = false
                vue.downloadClass = vue.selectedClass
            })
        },
        getPaymentData: function() {
            console.log(this.paymentError)
            var id = document.getElementById('runnerId').value
            vue = this
            getAPI("/api/admin/payment?number=" + id).then((data) => {
                console.log(data)
                if (data.success == false) {
                    vue.paymentError = data.error
                    setTimeout(function () {
                        if (vue.paymentError == data.error) {
                            vue.paymentError = null;
                        }
                    }, 3000);
                } else {
                    vue.paymentData = data.result
                }
            })
        },
        setPayment: function() {
            if (!this.paymentData) return;
            vue = this
            postAPI("/api/admin/payment", {number: vue.paymentData.number}).then((data) => {
                console.log(data)
                if (data.success == true) this.update();
                vue.paymentData = null;
                document.getElementById('runnerId').value = ""
            })
        }
    },
    mounted: function() {
        this.update()
        vue = this
        setTimeout(function () {
            if (vue.payment) {
                document.getElementById('runnerId').addEventListener("keyup", function(event) {
                    if (event.key === "Enter" || event.keyCode === 13) {
                        vue.getPaymentData()
                    }
                });
            } else {
                document.getElementById("name").addEventListener("keyup", function(event) {
                    if (event.key === "Enter" || event.keyCode === 13) {
                        document.getElementById('per_round').focus()
                    }
                });
                
                document.getElementById('per_round').addEventListener("keyup", function(event) {
                    if (event.key === "Enter" || event.keyCode === 13) {
                        vue.create()
                    }
                });
            }
        }, 500)
    }
});
