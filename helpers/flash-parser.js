module.exports = (error, success) => {
    let type;
    let flashMessage = null;

    if(error) {
        type = 'error';
        flashMessage = error;
    } else {
        type = 'success';
        flashMessage = success;
    }
    
    return (flashMessage !== undefined) ? [type, flashMessage] : null;
};
