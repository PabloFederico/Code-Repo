<script type="text/javascript">

 function CSVToArray(strData, strDelimiter){
        strDelimiter = (strDelimiter || ",");

        // Create a regular expression to parse the CSV values.
        var objPattern = new RegExp(
            (
                // Delimiters.
                "(\\" + strDelimiter + "|\\r?\\n|\\r|^)" +

                // Quoted fields.
                "(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|" +

                // Standard fields.
                "([^\"\\" + strDelimiter + "\\r\\n]*))"
            ),
            "gi"
            );


            var arrData = [[]];

        // Create an array to hold our individual pattern
        // matching groups.
        var arrMatches = null;


         while (arrMatches = objPattern.exec( strData )){

            // Get the delimiter that was found.
            var strMatchedDelimiter = arrMatches[ 1 ];

            if (
                strMatchedDelimiter.length &&
                strMatchedDelimiter !== strDelimiter
                ){

               arrData.push( [] );

            }

            var strMatchedValue;

            if (arrMatches[ 2 ]){

                // We found a quoted value. When we capture
                // this value, unescape any double quotes.
                strMatchedValue = arrMatches[ 2 ].replace(
                    new RegExp( "\"\"", "g" ),
                    "\""
                    );

            } else {

                // We found a non-quoted value.
                strMatchedValue = arrMatches[ 3 ];

            }


            arrData[ arrData.length - 1 ].push( strMatchedValue );
        }

        // Return the parsed data.
        return( arrData );
    }


var obtenerCantidadItems = function(lista)
{

var items  = null;

		 $().SPServices({
		    operation: "GetListItems",
		    async: false ,
		    listName: lista,
		    //CAMLViewFields:"<ViewFields><FieldRef Name='Nombre' /></ViewFields>",
		    completefunc: function (xData, Status) {
		    
		     items = $(xData.responseXML).SPFilterNode("z:row");         
		    
		    }
		  });

  return items.length;

}

var obtenerArchivos = function()
{

var items  = null;

		 $().SPServices({
		    operation: "GetListItems",
		    async: false ,
		    listName: "BibliotecaArchivos",
		    CAMLViewFields:"<ViewFields><FieldRef Name='Nombre' /><FieldRef Name='Equipo' /><FieldRef Name='Parseado' /></ViewFields>",
		    completefunc: function (xData, Status) {
		    
		     items = $(xData.responseXML).SPFilterNode("z:row");         
	
	    
		    }
		  });

  return items;




}


$( document ).ready(function() {
var seguir = null;
var items = obtenerArchivos();

for(var i=0;i<items.length;i++)
{
var archivo = $(items[i]).attr("ows_FileLeafRef").split('#')[1];
var IdItemActual = $(items[i]).attr('ows_ID');
if($(items[i]).attr("ows_DocIcon") == "csv"){

	if($(items[i]).attr('ows_Equipo').split('#')[1].split('-')[1]=="B")
	{
					if( $(items[i]).attr("ows_Parseado")=="Si") seguir = 1;//alert("El archivo "+$(items[i]).attr("ows_FileLeafRef").split('#')[1]+" ya fue parseado");
					else
					{
						alert("Se comenzará a grabar el archivo a la lista Altura-Linner");
						//$.blockUI({ message: '<h1><img src="busy.gif" />Espere...</h1>' });
							var archivo = $(items[i]).attr("ows_FileLeafRef").split('#')[1];
							$.ajax({
								url: "https://abinbevtest.sharepoint.com/sites/las_test/CPLAS/BibliotecaArchivos/"+archivo+"",
								async: false,
								success: function(data) {										  
									 var csv = CSVToArray(data,";");
									 var minimo = null;
									 var maximo = null;
									 var promedio = 0;
									 var total = 0;	
									 var cantidadreales = 0;
									 var valoractual = null;
									 	        
											for(var j=1;j<csv.length - 1; j++)
											{
												$().SPServices({
												operation: "UpdateListItems",
												async: false,
												batchCmd: "New",
												listName: "Autocontroles",
												//valuepairs: [["Fecha", csv[j][0]],["Hora", csv[j][1]], ["Producto", csv[j][2]],["LoteChapa", csv[j][3]],["Lote", csv[j][4].toString()],["Punzon", csv[j][5]],["Operador", csv[j][6]],["Altura", csv[j][7]],["Diametro", csv[j][8]],["VacIny", csv[j][9]],["IdCarga",IdItemActual]],
												valuepairs: [["Fecha", csv[j][0]],["Hora", csv[j][1]], ["Producto", csv[j][2]],["LoteChapa", csv[j][3]],["Lote", csv[j][4].toString()],["Punzon", csv[j][5]],["Operador", csv[j][6]],["AlturaLiner", csv[j][7]],["IdCarga",IdItemActual]],
												completefunc: function(xData, Status) {
																	          
													}
												});
												
														if(csv[j][7] != undefined && csv[j][7] != "" ){
														 	 cantidadreales = cantidadreales + 1;
															 valoractual = parseFloat(csv[j][7].replace(",","."));
															 total = total + valoractual;
															 if(valoractual > maximo || maximo == null) maximo = valoractual;
															 if(valoractual < minimo || minimo == null) minimo = valoractual; 
				 										}

														
											}
											var rango = parseFloat(maximo-minimo);
								        	alert("Lista Autocontroles cargada con éxito");
									        	$().SPServices({
													operation: "UpdateListItems",
													async: false,
													batchCmd: "New",
													listName: "Historial Altura-Linner",
													//valuepairs: [["Fecha", csv[j][0]],["Hora", csv[j][1]], ["Producto", csv[j][2]],["LoteChapa", csv[j][3]],["Lote", csv[j][4].toString()],["Punzon", csv[j][5]],["Operador", csv[j][6]],["Altura", csv[j][7]],["Diametro", csv[j][8]],["VacIny", csv[j][9]],["IdCarga",IdItemActual]],
													valuepairs: [["IdCarga",IdItemActual],["Promedio",total/cantidadreales],["Rango",rango]],
													completefunc: function(xData, Status) {
																		          
														}
													});

	
											    
										}
							});

							
							
									$().SPServices({
											operation: 'UpdateListItems',
											listName: 'BibliotecaArchivos',
											ID: IdItemActual,
											valuepairs: [["Parseado", "Si"]],
											completefunc: function(xData, Status) {
											}
									});
												
					}
							
	}
	
	//Tengo un archivo cargado de AlturaDiametro
	else if($(items[i]).attr('ows_Equipo').split('#')[1].split('-')[1]=="A")
	{
		if( $(items[i]).attr("ows_Parseado")=="Si") seguir = 1;
					else
					{
						alert("Se comenzará a grabar el archivo a la lista Altura-Diámetro");
						//$.blockUI({ message: '<h1>Just a moment...</h1>' });
						var archivo = $(items[i]).attr("ows_FileLeafRef").split('#')[1];
						$.ajax({
							url: "https://abinbevtest.sharepoint.com/sites/las_test/CPLAS/BibliotecaArchivos/"+archivo+"",
							async: false,
							success: function(data) {										  
								    var csv = CSVToArray(data,";");
								 	var totalaltura = 0;
									var totaldiametro = 0;
									var minimoaltura = null;
									var promedioaltura = 0;
									var maximoaltura = null;
									var valoractualaltura = null;
									var minimodiametro = null;
									var promediodiametro = 0;
									var maximodiametro = null;
									var valoractualdiametro = null;
									var cantidaddiametroreales = 0;
									var cantidadalturareales = 0;
										        
										for(var j=1;j<csv.length - 1; j++)
										{
											$().SPServices({
											operation: "UpdateListItems",
											async: false,
											batchCmd: "New",
											listName: "AlturaDiam",
											valuepairs: [["Fecha", csv[j][0]],["Hora", csv[j][1]], ["Producto", csv[j][2]],["LoteChapa", csv[j][3]],["Lote", csv[j][4].toString()],["Punzon", csv[j][5]],["Operador", csv[j][6]],["Altura", csv[j][7]],["Diametro", csv[j][8]],["VacIny", csv[j][9]],["IdCarga",IdItemActual]],
											completefunc: function(xData, Status) {
																          
												}
											});
											
														if(csv[j][7] != undefined && csv[j][7] != "" ){
														 	 cantidadalturareales = cantidadalturareales + 1;
															 valoractualaltura = parseFloat(csv[j][7].replace(",","."));
															 totalaltura = totalaltura + valoractualaltura;
															 if(valoractualaltura > maximoaltura || maximoaltura == null) maximoaltura = valoractualaltura;
															 if(valoractualaltura < minimoaltura || minimoaltura == null) minimoaltura = valoractualaltura; 
				 										}
				 										if(csv[j][8] != undefined && csv[j][8] != "" ){
														 	 cantidaddiametroreales = cantidaddiametroreales + 1;
															 valoractualdiametro = parseFloat(csv[j][8].replace(",","."));
															 totaldiametro = totaldiametro + valoractualdiametro;
															 if(valoractualdiametro> maximodiametro || maximodiametro == null) maximodiametro = valoractualdiametro;
															 if(valoractualdiametro< minimodiametro || minimodiametro == null) minimodiametro = valoractualdiametro; 
				 										}


											
													
										}
										var rangoaltura = parseFloat(maximoaltura-minimoaltura);
										var rangodiametro= parseFloat(maximodiametro - minimodiametro);
							        		
					           				alert("Lista Altura-Diámetro cargada con éxito");
					           				$().SPServices({
													operation: "UpdateListItems",
													async: false,
													batchCmd: "New",
													listName: "Historial Altura-Diámetro",
													//valuepairs: [["Fecha", csv[j][0]],["Hora", csv[j][1]], ["Producto", csv[j][2]],["LoteChapa", csv[j][3]],["Lote", csv[j][4].toString()],["Punzon", csv[j][5]],["Operador", csv[j][6]],["Altura", csv[j][7]],["Diametro", csv[j][8]],["VacIny", csv[j][9]],["IdCarga",IdItemActual]],
													valuepairs: [["IdCarga",IdItemActual],["PromedioAltura",totalaltura/cantidadalturareales],["RangoAltura",rangoaltura],["PromedioDiam",totaldiametro/cantidaddiametroreales],["RangoDiam",rangodiametro]],
													completefunc: function(xData, Status) {
																		          
														}
													});


										    
									}
							});
							
							$().SPServices({
											operation: 'UpdateListItems',
											listName: 'BibliotecaArchivos',
											ID: IdItemActual,
											valuepairs: [["Parseado", "Si"]],
											completefunc: function(xData, Status) {
											
											}
									});								
					
					}

		
	
	
	}	
	else 
	{alert("Archivo "+archivo+" con formato incorrecto para el parseo");
	return false;
	}
}
else alert("El archivo "+$(items[i]).attr("ows_FileLeafRef").split('#')[1]+" no fue parseado porque no es .csv");
	
	
}


	     
});

 


</script>
