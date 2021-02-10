const countryInput = document.getElementById('inputCountry');
const stateInput = document.getElementById('inputState');

countryInput.addEventListener('change', () => {
    const countryValue = document.getElementById('inputCountry').value;
    const API = `http://api.geonames.org/searchJSON?username=nostra&country=${countryValue}&style=MEDIUM`;
    stateInput.options.length = 0;
    
    fetch(API)
        .then(res => {
            return res.json();
        })
        .then(data => {
            var x = 1;
            for(let state of data.geonames) {                
                const stateName = state.adminName1;
                const stateCode = state.adminCode1;
                const fcode = state.fcode;

                if(stateName == undefined || stateName == null) {
                    continue;
                }

                if(stateCode == undefined || stateCode == null) {
                    continue;
                }

                for(i = 0; i < document.getElementById("inputState").length; ++i) {
                    if(document.getElementById("inputState").options[i].label == stateName || document.getElementById("inputState").options[i].value == stateCode) {
                        var found = true;
                        break;
                    }
                }
                if(found) {
                    found = false;
                    continue;
                }

                if((fcode != 'PPLA' && fcode != 'PPLA2' ) || fcode == 'undefined' || fcode == null) {
                    continue;
                }         

                const option = document.createElement("OPTION");
                option.label = stateName;
                option.value = stateCode;
                stateInput.appendChild(option);
            }

        })
        .catch(err => {
            console.log(err);
        });
});