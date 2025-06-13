<?php
require 'config.php';

$teams = [];
$stmt = $pdo->query("SELECT * FROM teams");

while ($row = $stmt->fetch()) {
    $teams[] = [
        'name' => $row['name'],
        'members' => explode(',', $row['members']),
        'score' => (int)$row['score']
    ];
}

echo json_encode(['teams' => $teams]);