//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash")
const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin_Mohammad:09348988150poiugg@cluster0.eo7xk.mongodb.net/todolistDB",{useNewUrlParser:true});

const itemSchema ={
name:String
};
const Item =  mongoose.model("item",itemSchema);



const item1 = new Item({
  name:"koko"
});
const item2 = new Item({
  name:"fofo"
});
const item3 = new Item({
  name:"lolo"
});
const DefaultItem=[item1,item2,item3];

const listSchema ={
  name: String,
  items:[itemSchema]
};

const List = mongoose.model("list",listSchema);


app.get("/", function(req, res) {

  Item.find({},function(err,foundItems){

    if(foundItems.length===0){

      Item.insertMany(DefaultItem,function(err){
        if(err){
          console.log(err);
        }else{
          console.log('Secussefully added');
        }
      });
      res.redirect("/");

    }else {
        res.render("list", {listTitle:"today", newListItem: foundItems});
    }
});
});



app.post("/Delete",function(req,res){
  const IdItem =req.body.checkbox1;
  const listName= req.body.listName;
console.log(listName);

  if(listName === "today"){
    Item.findByIdAndDelete(IdItem ,function(err){

      if(err){
        console.log(err);
      }
      else{
       console.log("success");
      res.redirect("/")
    }
    });
  }else{
    List.findOneAndUpdate({name: listName } , {$pull: { items: {_id: IdItem }}},function(err) {
      if(!err){
        res.redirect("/" + listName);
      }
    });
  }
});


app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;
  const item4 = new Item({
    name: itemName
  }); 
  List.findOne({name:listName},function(err,foundList) {
      if(listName ==="today"){
        item4.save()
        res.redirect("/");
      }else{
        foundList.items.push(item4);
        foundList.save();
        res.redirect("/" + listName);
      }
    });
  });

app.get("/:type",function (req,res) {

  const urlName = _.capitalize(req.params.type);

List.findOne({name : urlName },function(err,foundList) {
  
  if(!err){
    if(!foundList){
      //createNewList
      const list = new List ({
        name:urlName,
        items:DefaultItem
      });
      list.save();
      res.redirect("/" + urlName);
 
  
    }else{
      //show Existing List

      res.render("list",{listTitle:foundList.name, newListItem: foundList.items});
    }
  }
});
});


app.post("/Add",function(req,res){
  const listName = req.body.addList
   
  List.insertMany(listName,function(err){
    if(err){
      console.log(err);
    }else{
      console.log("sucssfull insert")
    }
  })
  res.redirect("/"  + listName);
})


let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}


app.listen(port,function() {
  console.log("Server started on port 3000");
});
