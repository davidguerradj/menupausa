lua54 "yes" -- needed for Reaper



fx_version 'cerulean'
games { 'gta5' }

shared_scripts {
    "@es_extended/imports.lua",
    'shared/config.lua'
}

client_scripts {
    'client/*.lua'
}

server_scripts {
    'server/*.lua'
}

ui_page 'html/ui.html'

files {
    'html/css/*.css',
    'html/js/*.js',
    'html/**/*.png',
    'html/sounds/*.mp3',
    'html/sounds/*.wav',
    'html/sounds/*.ogg',
    'html/ui.html'
}
