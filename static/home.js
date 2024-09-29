document.addEventListener('DOMContentLoaded', ()=>{


document.getElementById('logout').addEventListener('click', async () =>{
    const response=await fetch('/logout',{method:'GET'})
    if(response.ok){
        const data = await response.json();
        alert(data.message);
        window.location.href = '/login'; 
    }
    else{
        alert('logout failed')
    }
})

})