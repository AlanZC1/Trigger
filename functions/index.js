const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();
const db = admin.firestore();

exports.onUserCreate = functions.firestore.document('Reservaciones/{ReservacionesId}').onCreate(async (snap, context) => {
  const values = snap.data();
  //Obtener todas las reviews que haya echo un cliente
  const query = db.collection("Reviews");
  const snapshot = await query.where("id_cliente", "==", values.id_cliente).get();
  //console.log("Id_cliente: " + values.id_cliente);
  var calificaciones_malas = 0; //Conteo de las calificaciones malas que haya hecho un usuario
  snapshot.forEach(x=>{
    var calificacion = x.data().calificacion;
    //console.log("Calificacion: " + calificacion);
    if(calificacion <= 2){ //Calificación baja
      calificaciones_malas = calificaciones_malas + 1; //Acumular las calificaciones malas
    }
  })
  try {
    if(calificaciones_malas > 2){ //Ya tiene dos calificaciones malas
      const res = await db.collection("Reservaciones").doc(snap.id).delete(); //Eliminar el último documento
      //console.log("Id_reservación: " + snap.id);
      console.log(`El cliente con la id '${values.id_cliente}' no puede reservar!`);
    }
  } catch (error) {
    console.log(error);
  }
});
