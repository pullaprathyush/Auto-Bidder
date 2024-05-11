const PDFDocument = require('pdfkit');
const fs = require('fs');
const { fontSize } = require('pdfkit');

async function createPDF(data) {
  const doc = new PDFDocument();
  doc.pipe(fs.createWriteStream(`./public/reports/${data.regNo}.pdf`));
  doc.on("pageAdded",()=>{
    let fontSize=doc._fontSize;
    doc.fontSize(11).font("Helvetica-Bold").fillColor("teal").text("Car Tijarat\u00AE",100,5,{align:"right"});
    doc.fontSize(fontSize).font(doc._font.name).fillColor("black");
    doc.moveDown()
  })
  doc.rect(0,0,1000.28,841.89).fill('teal');
  doc.circle(320,325,130).fill("white");
  doc
    .fontSize(25).fillColor("white")
    .text('Car Tijarat\nCar Condition Report', 100, 100,{align:"center",underline:true,backgroundColor:"blue"});
    doc.fontSize(16).fillColor("black").text("Car Registeration # "+data.regNo,100,300,{align:"center",})
    doc.fontSize(16).text("Mechanic Name :"+data.mechanicName,{align:"center",})
    doc.fontSize(16).text("Mechanic contact# "+data.mechanicPhone,{align:"center",})
  
  let attrCount=0;
  doc.addPage({
    margin:5
  })
    .fillColor('black').fontSize(20)
    .text('Condition Review', 0, 100,{
      underline:true,
      align:"center"
    });

  for(let a in data.attributes){
    doc.moveDown()
    
    doc.moveDown();
    const x=doc.x,y=doc.y;
    doc.font('Times-Bold').fillColor("black").fontSize(15).text(a,0,doc.y,{align:"center",underline:true});
    doc.fillColor("black").fontSize(12).text(`Rating:${data.attributes[a].rating}/10 `,doc.x,doc.y+5,{align:"right"});
    doc.text("Condition Description:",{align:"left"});
    doc.fillColor("blue").font("Helvetica").fontSize(11).text(data.attributes[a].comment==''?"(no comments from mechanic)":data.attributes[a].comment,doc.x+20,doc.y)
    doc.rect(0,y-5,610,doc.y+5-y).fillOpacity(0.1).fillAndStroke("teal","black");
    doc.fillOpacity(1)
    attrCount++;
    if(attrCount%6==0){
      doc.addPage({margin:5})
    }
  }
  // Finalize PDF file
  doc.end();
  return "Report generated successfully";
}
module.exports=createPDF;