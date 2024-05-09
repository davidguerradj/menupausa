local PlayerProps = {}
function startAnim(lib, anim)
    ESX.Streaming.RequestAnimDict(lib, function()
        TaskPlayAnim(PlayerPedId(), lib, anim, 2.0, 2.0, -1, 51, 0.0, false, false, false)
        AddPropToPlayer("prop_cs_tablet", 28422, -0.05, 0.0, 0.0, 0.0, 0.0, 0.0)
    end)
end
function AddPropToPlayer(prop1, bone, off1, off2, off3, rot1, rot2, rot3)
    local Player = PlayerPedId()
    local x,y,z = table.unpack(GetEntityCoords(Player))
  
    if not HasModelLoaded(prop1) then
      LoadPropDict(prop1)
    end
  
    prop = CreateObject(GetHashKey(prop1), x, y, z+0.2,  true,  true, true)
    AttachEntityToEntity(prop, Player, GetPedBoneIndex(Player, bone), off1, off2, off3, rot1, rot2, rot3, true, true, false, true, 1, true)
    table.insert(PlayerProps, prop)
    PlayerHasProp = true
    SetModelAsNoLongerNeeded(prop1)
end

function EmoteCancel()
    ClearPedTasks(GetPlayerPed(-1))
    DestroyAllProps()
end

function DestroyAllProps()
    for _,v in pairs(PlayerProps) do
      DeleteEntity(v)
    end

end

function LoadPropDict(model)
    while not HasModelLoaded(GetHashKey(model)) do
      RequestModel(GetHashKey(model))
      Wait(10)
    end
  end

Citizen.CreateThread(function()

        while true do
            Wait(0)
            SetPauseMenuActive(false)
            if (IsControlJustPressed(0, 200) and not IsPauseMenuActive() and not IsPauseMenuRestarting() and not IsNuiFocused()  ) then
                TransitionToBlurred(1000)
                SetNuiFocus(true, true)
                TriggerServerEvent("pausemenu:server")
                startAnim('amb@code_human_in_bus_passenger_idles@female@tablet@idle_a', 'idle_a')

            end
        end
    end)

    -- Function to close menu
    function ClosePause()
        EmoteCancel()
        TransitionFromBlurred(1000)
        SetNuiFocus(false, false)
    end

    -- Close button; closes menu
    RegisterNUICallback('closeMenu', function(data)
        ClosePause()
    end)

    -- Settings button; sends to GTA options
    RegisterNUICallback('openSettings', function(data)
        ClosePause()
        ActivateFrontendMenu('FE_MENU_VERSION_LANDING_MENU',0, 1)
    end)

    RegisterNUICallback('openMap', function(data)
        ClosePause()
        
        ActivateFrontendMenu(GetHashKey('FE_MENU_VERSION_MP_PAUSE'),0,-1)
    end)

    -- Disconnect button; drops player
    RegisterNUICallback('exitGame', function(data)
        TriggerServerEvent('salir')
    end)

RegisterNUICallback('paybill', function(data,cb)
        data.id = tonumber(data.id)
        data.price = tonumber(data.price)
    if data.job == "notjobjobjobjob" then 
        ESX.TriggerServerCallback('esx_billing:payBill', function(cal)
        cb(cal)
        end, data.id)
    elseif data.job == "police" then 
        exports['origen_police']:PayBill({
            id = data.id,
            price = data.price
        })
        cb(true)
    elseif data.job ~= "police" and data.job ~= "notjobjobjobjob" then
        exports['origen_masterjob']:PayBill({
            id = data.id,
            price = data.price,
            job = data.job
        })
        cb(true)
    end
end)

RegisterNUICallback('facturas', function(data,cb)
    local masterjob = GetResourceState("origen_masterjob")
    local police = GetResourceState("origen_police")

    local elements = {}

    ESX.TriggerServerCallback('esx_billing:getBills', function(bills)
        if #bills > 0 then
            for k,v in ipairs(bills) do
                elements[#elements+1] = {
                    title = v.label,
                    price = ESX.Math.GroupDigits(v.amount),
                    billId = v.id,
                    job = "notjobjobjobjob"
                }
            end
        end
    end)



    if masterjob == "started"  then
        local canopenmenu1 = false
        ESX.TriggerServerCallback("origen_masterjob:server:GetBills", function(bills)
            
                for i = 1, #bills do
                    elements[#elements+1] = {
                        title = bills[i].title,
                        billId = bills[i].id,
                        price = bills[i].price,
                        job = bills[i].job
                    }
                end
                canopenmenu1 = true 
            end)
            while not canopenmenu1 do 
                Wait(0)
            end
    end
    if police == "started"  then
    local canopenmenu2 = false
        ESX.TriggerServerCallback("origen_police:server:GetBills", function(bills)
    
            for i = 1, #bills do
            elements[#elements+1] = {
                title = bills[i].title,
                billId = bills[i].id,
                price = bills[i].price,
                job = "police"
            }
            end
            canopenmenu2 = true
  
    end)
    while not canopenmenu2 do 
        Wait(0)
    end
end
Wait(200)
    cb(elements)
end)

RegisterNUICallback('negocios', function(data,cb)
   local negocios = {}
   for k,v in pairs(Config.Negocios) do 
    negocios[#negocios+1] = {
        label = v.label,
        coords = v.coords,
        open = v.open
    }
   end
    cb(negocios)
end)

RegisterNUICallback("SetWaypointinCoords", function(data, cb)
    SetNewWaypoint(data.x, data.y)
    ESX.ShowNotification("Se asigno un nuevo marcador en el mapa")
end)

RegisterNetEvent("origen_notify:business", function(data)
    Config.Negocios[data.job]['open'] = data.value
end)

RegisterNetEvent("pausemenu:client", function(data)
    SendNUIMessage({
        action = "OpenMenu",
        name = data.name,
        job = data.job,
        cash = data.cash,
        bank = data.bank,
        discord = Config.Discord,
        instagram = Config.Instagram,
        twitter = Config.Twitter,
        youtube = Config.Youtube,
        website = Config.Website,
        usersOnline = data.players,
        maxPlayers =  data.max ,
        police = data.police,
        ems = data.ems,
    })
end)

RegisterNetEvent("pausemenu:updatejobs", function(data)
    SendNUIMessage({
        action = "updatejobs",
        police = data.police,
        ems = data.ems,
    })
end)

RegisterNUICallback('PlayerId', function(_,cb) 
    local serverId = GetPlayerServerId(PlayerId())
    cb(serverId)
end)