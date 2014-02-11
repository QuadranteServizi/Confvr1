<?php

/*
    jqmbuilder.com
    Script to send email from jQuery Mobile Site.
    Author: Sam Deering 2012
*/

header('content-type: application/json; charset=utf-8');

if (isset($_POST["name"]) && isset($_POST["email"]) && isset($_POST["msg"]))
{
    $recipent = array(
        "name" => strip_tags($_POST["contact_name"]),
        "email" => strip_tags($_POST["contact_email"])
    );

    //specify your own here to override if you want.
    // $recipent = array(
    //     "name" => "Sam Deering",
    //     "email" => "info@jqmbuilder.com"
    // );

    $sender = array(
        "name" => strip_tags($_POST['name']),
        "email" => strip_tags($_POST['email']),
        "message" => strip_tags($_POST['msg'])
    );

    $subject = 'Contact message from mobile website';

    $message = '<html><head><title>'.$title.'</title></head><body>'.$sender["message"].'</body></html>';

    // To send HTML mail, the Content-type header must be set
    $headers = "From: {$sender['name']} <{$sender['email']}>" . "\r\n";
    $headers .= "Reply-To: {$sender['email']}" . "\r\n";
    $headers .= "MIME-Version: 1.0\r\n";
    $headers .= "Content-Type: text/html; charset=ISO-8859-1\r\n";

    if(mail($recipent["email"], $subject, $message, $headers))
    {
        echo json_encode(true);
    }
    else
    {
        echo json_encode(false);
    }

}
else
{
    echo json_encode(false);
}

?>