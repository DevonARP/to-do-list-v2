const express = require("express")
const bodyParser = require("body-parser")
const mongoose = require("mongoose")
const _ = require("lodash")

const app = express()


app.set("view engine","ejs")

app.use(bodyParser.urlencoded({extended:true}))
app.use(express.static("public"))

mongoose.connect("mongodb://localhost:27017/todolistDB", {useNewUrlParser: true})

const itemsSchema ={
    name: String,
}

const Item = mongoose.model("Item",itemsSchema)

const item1 = new Item({
    name: "Welcome to your todo list!"
})
const item2 = new Item({
    name: "Hit button to add an item!"
})
const item3 = new Item({
    name: "Hit to delete!"
})

const defaultItems = [item1,item2,item3]

const listSchema = {
    name: String,
    items: [itemsSchema]
}

const List = mongoose.model("List",listSchema)




app.get("/",function(req,res){

    Item.find().then(function(x){

        if(x.length===0){
            Item.insertMany(defaultItems).then(function(x){
                console.log(x)
            }).catch(function(err){
                console.log(err)
            })
            res.redirect("/")
        } else{
            res.render("lists",{kindOfDay:"Today", newListItem: x})
        }

    }).catch(function(err){
        console.log(err)
    })

})

app.post("/",function(req,res){


    const itemName = req.body.newItem
    const listName = req.body.lists

    const item = new Item({
        name: itemName
    })

    if(listName==="Today"){
        item.save()

        res.redirect("/")
    } else{
        List.findOne({name:listName}).then(function(x){
            x.items.push(item)
            x.save()
            res.redirect("/"+listName)
        
        })
    }

})

app.post("/delete",function(req,res){

    const checkedItemId = req.body.checkbox
    const listName = req.body.listName

    if (listName === "Today"){

        Item.findByIdAndRemove(checkedItemId).then(function(x){
            console.log("Item deleted")
    
            res.redirect("/")
        })

    } else{

        List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItemId}}}).then(function(x){
            console.log("Item deleted")
    
            res.redirect("/"+listName)
        })

    }



})


app.get("/:customListName",function(req,res){

    const customListName = _.capitalize(req.params.customListName)

    List.findOne({name:customListName}).then(function(x){
        if(!x){
            const list = new List({
                name: customListName,
                items: defaultItems
            })
            list.save()
            res.redirect("/" + customListName)
        } else{
            res.render("lists",{kindOfDay:x.name, newListItem: x.items})
        }
    })

    const list = new List({
        name: customListName,
        items: defaultItems
    })

    list.save()

})

app.post("/work",function(req,res){

    let item = req.body.newItem
    workItems.push(item)
    res.redirect("/work")

})

app.get("/about",function(req,res){

    res.render("about")

})

app.listen(3000,function(){
    console.log("Server is listening on 3000")
})