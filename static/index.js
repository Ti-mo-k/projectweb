document.addEventListener('DOMContentLoaded', () => {
    const register =document.getElementById('register')
    register.addEventListener('click', () => { 
        window.location.href ='/register';
     })

     const login = document.getElementById('login')
     login.addEventListener('click', () => {
        window.location.href ='/login';
     })

})