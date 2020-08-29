for(let i = 1 ; i < 255; i++){
    for(let j = 1 ; j < 255; j++){
        if((i | j) === 97){
            console.log(i , j);
        }
    }
}