//User signup form validation 

const form = document.getElementById('forgotPassword'); 
const phone = document.getElementById('mno');
const password = document.getElementById('password');
const password2 = document.getElementById('password2')

const setError = (element, message, e) => {
    e.preventDefault();
    const inputControl = element.parentElement;
    const errorDisplay = inputControl.querySelector('.error');

    errorDisplay.innerText = message;
    inputControl.classList.add('error');
    inputControl.classList.remove('success');
};
const setSuccess = element => {
    const inputControl = element.parentElement;
    const errorDisplay = inputControl.querySelector('.error');
    errorDisplay.innerText = '';
    inputControl.classList.add('success');
    inputControl.classList.remove('error');
};


const setVisible = (x) => {
    var element = document.getElementById(x);
    element.style.display = 'block'; 
}
  
const setHide = (x) => {
    var element = document.getElementById(x);
    element.style.display = 'none'; 
}

function validateInputs(e) {
  
    setSuccess(phone);
    setSuccess(password);
    setSuccess(password2);

    const phoneValue = phone.value.trim();
    const passwordValue = password.value.trim();
    const passwordValue2 = password2.value.trim()



    const phonenoRegex = /^\d{10}$/;
    if(phoneValue === ""){
        setError(phone, 'Enter a valid phone number ', e);
        phone.focus();
        return false;
    }
    else if(!phoneValue.match(phonenoRegex)){
        setError(phone, 'Enter a valid phone number', e);
        phone.focus();
        return false;
    }
    else{
        setSuccess(phone);
    }

    const passwordRegex  = /^[a-zA-Z0-9!@#$%^&*]{6,16}$/;
    if(passwordValue === '') {
        setError(password, 'Please enter password', e);
        password.focus();
        return false;
    }
    else if(!passwordValue.match(passwordRegex)){
        setError(password, 'Min 6 characters', e);
        password.focus();
        return false;
    }
    else{
        setSuccess(password);
    }

    if(passwordValue !== passwordValue2){
        setError(password2, 'Passwords do not match. Please re-enter them.',e);
        password2.focus()
        return false
    }else{
        setSuccess(password2)
    }


    return true;
}

form.addEventListener('submit', function(e) {
    // e.preventDefault()
    console.log('form submit was recorded');
    if(validateInputs(e)){
        console.log("VALIDATION Success");
}
})
