//DEIXAR APENAS NÚMEROS NO INPUT TYPE TEXT;
function apenasNumeros(event) {
    const charCode = (event.which) ? event.which : event.keyCode;
    if (charCode != 44 && charCode > 31 && (charCode < 48 || charCode > 57)) {
      event.preventDefault();
      return false;
    }
    return true;
  }
  
  function formatarValor(input) {
    input.value = input.value.replace(/[^0-9,]/g, '');
    
    const partes = input.value.split(",");
    if (partes.length > 2) {
      partes[1] = partes.pop();
    }
    
    input.value = partes.join(",");
  }


  //FECHAR POPUP
  function fecharModal(){
      document.querySelector('.popup-acoes').style.cssText = 'opacity: 0; transition: all 600ms;'
      setTimeout(() => {
        document.querySelector('.popup-acoes').style.cssText = 'display: none;'
      }, 700);
  }