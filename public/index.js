// Allow users to sign in when they enter the application and be able to send messages

$(document).ready(function(){
    // Initiating our Auth0Lock
    let lock = new Auth0Lock(
        'CLIENT_ID',
        'CLIENT_DOMAIN',
        {
            auth: {
                params: {
                    scope: 'openid profile'
                }
            },
            autoclose: true;
            closable: false;
            rememberLastLogin: true
        });
        
        // Listening for the authenticated event
        lock.on("authenticated", function(authResult){
        // Use the token in authResult to getUserInfo() and save it to localStorage
            lock.getUserInfo(authResult.accessToken, function(error, profile){
                if (error){
                    return;
                }
                localStorage.setItem('accessToken', authResult.accessToken);
                localStorage.setItem('profile', JSON.stringify(profile));
                localStorage.setItem('isAuthenticated', true);
                updateValues(profile, true);
                $("#username").html(profile.name);
            });
        });
    
    let profile = JSON.parse(localStorage.getItem('profile'));
    let isAuthenticated = localStorage.getItem('isAuthenticated');
    
    function updateValues(userProfile, authStatus){
        profile = userProfile;
        isAuthenticated = authStatus;
    }
    
    $("#logout").click((e) => {
        e.preventDefault();
        logout();
    });
    
    function logout(){
        localStorage.clear();
        isAuthenticated = false;
        lock.logout({
            returnTo: "http://localhost:5000"
        });
    }
    
    function onMessageAdded(data){
        let template = $("#new-message").html();
        template = template.replace("{{body}}", data.message);
        template = template.replace("{{name}}", data.name);
        
        $(".chat").append(template);
    }
    
    if(!isAuthenticated && !window.location.hash){
        lock.show(); //show lock widget
    }
    else{
        //Enable pusher loggin -- don't include this in productino
        Pusher.logToConsole = true;
        
        var pusher = new Pusher({
            secret: 'ae4e7cc011c6edddf843',
            cluster: 'us3',
            encrypted: true
        });
        
        var channel = pusher.subscribe('private-chat');
        channel.bind('message-added', onMessageAdded);
        
        $('#btn-chat').click(function(){
            const message= $("#message").val();
            $("#message").val("");
            // Send messages
            $.post("http://localhost:5000/message", {message, name: profile.name});
        });
    }
});



