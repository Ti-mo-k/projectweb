document.addEventListener('DOMContentLoaded', () => {
    const register=document.getElementById('register');

    register.addEventListener('submit', async (e) =>{
        e.preventDefault();

        const formdata =new FormData('register')

        const name = formdata.get('name')
        const username = formdata.get('username')
        const email= formdata.get('email')
        const password= formdata.get('password')

        try {
            const response = await fetch('register',{
                method: "POST",
                headers:{
                    'content-type':'application/json'
                },
                body: JSON.stringify({name,username,email,password})

            });
            if (response.ok) {
                alert('registration successful');
            } else {
                alert('registration failed');
                
            }


        } catch (error) {
           console.error('error:', +error) 
        }

    })
});