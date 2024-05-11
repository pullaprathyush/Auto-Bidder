const CronJob = require('cron').CronJob;
const auctionModel= require('./models/auctionModel.js')
const seller=require('./controllers/sellerController.js').getSellerInfo;
var nodemailer = require('nodemailer');
const Auction=new auctionModel();
function getDate(days){
    var today = new Date();
    today.setDate(today.getDate() + days);
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    var hh=String(today.getHours()).padStart(2,'0');
    var MM=String(today.getMinutes()).padStart(2,'0');
    var ss=String(today.getSeconds()).padStart(2,'0')
    var yyyy = today.getFullYear();

   let date1=  yyyy+'-'+mm+'-'+dd+" "+hh+':'+MM+':'+ss;
    return date1;
//2021-12-27 12:23:48
}


let roomsState = []; // highest bidder with his bid & total number of bids placed in a particular auction

function auctionRoomState(RoomID){
    let room = roomsState.find(room => room.RoomID === RoomID);
    
    if(room){
        
    }
    else{
        room = { RoomID , highestBid: 0, bidderID: '---', bidCount: 0 };
        roomsState.push(room);
    }

    return room;
}

function getAuctionRoomState(RoomID){
    let room = roomsState.find(room => room.RoomID === RoomID);

    return room || null;
}

function setHighestBid(RoomID, bid, bidderID){
    const roomIndex = roomsState.findIndex(room => room.RoomID === RoomID);
    roomsState[roomIndex].highestBid = bid;
    roomsState[roomIndex].bidderID = bidderID;
    roomsState[roomIndex].bidCount += 1;
}


let bidders = []; // last bid & total number of bids placed by a bidder in a particular auction

function biddersBid(RoomID, bidderID){
    let bidder = bidders.find(bidder => bidder.bidderID === bidderID && bidder.RoomID === RoomID);

    if(bidder){

    }
    else{
        bidder = { RoomID, bidderID, lastBid: 'No Bid placed', bidCount: 0 };
        bidders.push(bidder);
    }

    return bidder;
}

function setLastBid(RoomID, bidderID, lastBid){
    const bidderIndex = bidders.findIndex(bidder => bidder.bidderID === bidderID && bidder.RoomID === RoomID);
    bidders[bidderIndex].lastBid = lastBid;
    bidders[bidderIndex].bidCount += 1;
}

function clearRoom(RoomID){
    //console.log(roomsState);
    let newRoomState = roomsState.filter(room => room.RoomID !== RoomID);
    roomsState = newRoomState;
    //console.log(roomsState);
}

function clearBidders(RoomID){
    //console.log(bidders);
    let getBidders = bidders.filter(bidder => bidder.RoomID === RoomID);
    let newBiddersArray = bidders.filter(bidder => bidder.RoomID !== RoomID);
    bidders = newBiddersArray;
    //console.log(bidders);

    return getBidders;
}

const sendEmail=async (email,content)=>{
    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.AppEmail,
          pass: process.env.EmailPW
        }
      });
      
      var mailOptions = {
        from:process.env.appEmail,
        to: [email,"k180224@nu.edu.pk"],
        subject: 'Car Tijarat Auction Update',
        html:content
      };
      
      transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          console.log(error);
        } else {
          console.log('Email sent: ' + info.response);
        }
      });
}
// xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxNotification Servicexxxxxxxxxxxxxxxxxxx
const job = new CronJob('0 */2 * * * * ',async function () {
           console.log("service triggered") 
        try{
            console.log("checking for ended auctions....")
            const winners= await  Auction.getWinner();
            if(winners.length>0)
            {
            const sellers=await Promise.all(winners.map((v)=>seller(v.Id)))
            auctions=winners.map((v)=>{
                return v.Id
            })
            for(let i=0;i<winners.length;i++){
                sellerContent=`
                <html>
                <meta charset="UTF-8">
                <body>
                <h1 style="color:white; background-color:teal ;text-align:center;border-radius:5px">Congrats ${sellers[i][0].full_name} Your Auction is Completed 🎉</h1>
                    <div><h4>Auction Details</h4>
                    <table border=1 style="margin-right: auto;margin-left: auto;text-align: center;color: white;background-color: teal;">
                    <tr>
                        <th>Car License Number</th><td>${winners[i].car}}</td>
                        </tr>
                        <tr>
                        <th>Bidder Name</th><td>${winners[i].full_name}</td>
                        </tr>
                        <tr>
                        <th>Bidder Contact </th><td>${winners[i].contact_no}</td>
                        </tr>
                        <tr>
                        <th>Bid Amount</th><td>PKR ${winners[i].amt} </td>
                        </tr>
                        </table>
                        <p>For further process please contact Mr/Ms ${winners[i].full_name}</p>
                    </div>
                    </body>
                    </html>                       
                `
                WinnerContent=`
                <html>
                <meta charset="UTF-8">
                <body>
                <h1 style="color:white; background-color:teal;text-align:center;border-radius:5px ">Congrats ${winners[i].full_name} You have Won the Auction 🎊 </h1>
                    <div><h4>Auction Details</h4>
                        <table border=1 style="margin-right: auto;margin-left: auto;text-align: center;color: white;background-color: teal;">
                        <tr>
                        <th>Car License Number</th><td>${winners[i].car}}</td>
                        </tr>
                        <tr>
                        <th>seller Name</th><td>${sellers[i][0].full_name}</td>
                        </tr>
                        <tr>
                        <th>seller Contact </th><td>${sellers[i][0].contact_no}</td>
                        </tr>
                        <tr>
                        <th>Payable Amount</th><td>PKR ${winners[i].amt}</td>
                        </tr>
                        </table>
                        <p>For further process please contact Mr/Ms  ${sellers[i][0].full_name}</p>
                    </div>
                    </body>
                    </html>                
                `;
                sendEmail(sellers[i].email,sellerContent);sendEmail(winners[i].email,WinnerContent)
                
            }
            Auction.updateStatus("completed",auctions)
            }else 
               console.log("No auctions to be updated")
        }
        catch(e){
            console.log(e);
        }
        
    
});

 
module.exports={ 
    getDate,job, auctionRoomState, getAuctionRoomState, setHighestBid, biddersBid, setLastBid, clearRoom, clearBidders
};