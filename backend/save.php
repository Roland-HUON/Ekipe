<?php
require 'config.php';

$data = json_decode(file_get_contents("php://input"), true);
$teams = $data['teams'] ?? [];

$pdo->exec("DELETE FROM teams");
$stmt = $pdo->prepare("INSERT INTO teams (name, members, score) VALUES (?, ?, ?)");

foreach ($teams as $team) {
    $stmt->execute([
        $team['name'],
        implode(',', $team['members']),
        $team['score']
    ]);
}

echo json_encode(['success' => true]);