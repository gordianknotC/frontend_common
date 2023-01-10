export function wait (span: number): Promise<boolean>{
    return new Promise(resolve =>{
      setTimeout(()=>{
        resolve(true);
      }, span);
    });
  }
  
  export function time(): number{
    return (new Date()).getTime();
  }
  