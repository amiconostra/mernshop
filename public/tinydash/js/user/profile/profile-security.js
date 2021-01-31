const activityLogCheckbox = document.getElementById('activityLog');

activityLogCheckbox.addEventListener('change', function(){
    const userId = document.body.querySelector('[name=userId]').value;
    const csrf = document.body.querySelector('[name=_csrf]').value;
    const activityLogValue = activityLogCheckbox.checked;

    fetch(`/dashboard/profile-security/${userId}`, {
        method: 'PUT',
        headers: {
            'csrf-token': csrf,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            activityLog: activityLogValue
        })
    })
    .then(response => {
        return response.json();
    })
    .then(data => {
        // console.log(data);
    })
    .catch(err => {
        console.log(err);
    });
});